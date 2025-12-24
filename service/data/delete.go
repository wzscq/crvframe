package data

import (
	"crv/frame/common"
	"crv/frame/definition"
	"database/sql"
	"log/slog"
)

type Delete struct {
	ModelID         string    `json:"modelID"`
	SelectedRowKeys *[]string `json:"selectedRowKeys"`
	AppDB           string    `json:"appDB"`
	UserID          string    `json:"userID"`
	UserRoles       string    `json:"userRoles"`
	Filter     *map[string]interface{} `json:"filter"`
	SelectAll        bool     `json:"selectedAll"`
}

func (delete *Delete) getPermissionIds(dataRepository DataRepository) (*[]string, int) {
	slog.Debug("start getPermissionIds")
	//根据用户权限，获取允许删除数据的id列表
	permissionDataset, errorCode := definition.GetUserDataset(delete.AppDB, delete.ModelID, delete.UserRoles, definition.DATA_OP_TYPE_MUTATION)
	if errorCode != common.ResultSuccess {
		return nil, errorCode
	}

	//这里本来是考虑SelectAll为false时，是按照勾选记录ID删除，可以不做权限过滤，
	if permissionDataset.Filter == nil && delete.SelectAll == false {
		slog.Debug("end getPermissionIds with nil filter")
		return delete.SelectedRowKeys,common.ResultSuccess
	}

	//这是补充的代码，用于处理数据权限中的过滤条件
	if permissionDataset.Filter != nil && permissionDataset.NeedFilterProcess == true {
		var filterData *[]FilterDataItem
		if(permissionDataset.FilterData != nil){
			var err error
			filterData,err=ConvertToFileterData(permissionDataset.FilterData)
			if err != nil {
				return nil, common.ResultWrongFilterDataInDataset
			}
		}

		errorCode = ProcessFilter(
			permissionDataset.Filter,
			filterData,
			nil,
			delete.UserID,
			delete.UserRoles,
			delete.AppDB,
			dataRepository)

		if errorCode != common.ResultSuccess {
			return nil, errorCode
		}
	}

	var filter *map[string]interface{}
	if delete.SelectAll == true {
		if permissionDataset.Filter == nil {
			filter=delete.Filter
		} else {
			filter=&map[string]interface{}{
				Op_and: []interface{}{
					*(delete.Filter),
					*(permissionDataset.Filter),
				},
			}
		}
	} else {
		filter=&map[string]interface{}{
			Op_and: []interface{}{
				map[string]interface{}{
					"id": map[string]interface{}{
						Op_in: *(delete.SelectedRowKeys),
					},
				},
				*(permissionDataset.Filter),
			},
		}
	}

	//查询符合条件的数据ID
	query := &Query{
		ModelID: delete.ModelID,
		Filter: filter,
		Fields: &[]Field{
			Field{
				Field: "id",
			},
		},
		AppDB:     delete.AppDB,
		UserRoles: delete.UserRoles,
	}

	result, errorCode := query.Execute(dataRepository, false)
	if errorCode != common.ResultSuccess {
		return nil, errorCode
	}

	if len(result.List) == 0 {
		slog.Debug("end getPermissionIds with no permission")
		return nil, common.ResultNoPermission
	}

	idList:=make([]string,len(result.List))
	for index, row := range result.List {
		idList[index]=replaceApostrophe(row["id"].(string))
	}
	
	return &idList,common.ResultSuccess
}

func (delete *Delete) idListToString(idList *[]string) (string, int) {
	strIDs := ""
	if len(*idList) <= 0 {
		return "", common.ResultNoIDWhenDelete
	}

	for _, strID := range *idList {
		strIDs = strIDs + "'" + replaceApostrophe(strID) + "',"
	}
	//去掉末尾的逗号
	strIDs = strIDs[0 : len(strIDs)-1]

	return strIDs, common.ResultSuccess
}

func (delete *Delete) delete(dataRepository DataRepository, tx *sql.Tx) (*map[string]interface{}, int) {
	//获取所有待删数据ID列表字符串，类似：'id1','id2'
	idList, errorCode := delete.getPermissionIds(dataRepository)
	
	slog.Debug("delete.delete","getPermissionIds errorCode",errorCode)
	
	if errorCode != common.ResultSuccess {
		return nil, errorCode
	}

	strIDs,errorCode:=delete.idListToString(idList)
	if errorCode != common.ResultSuccess {
		return nil, errorCode
	}

	sql := "delete from " + delete.AppDB + "." + delete.ModelID + " where id in (" + strIDs + ")"

	_, rowCount, err := dataRepository.ExecWithTx(sql, tx)
	if err != nil {
		return nil, common.ResultSQLError
	}
	result := map[string]interface{}{}
	result["count"] = rowCount
	result["modelID"] = delete.ModelID

	//还要删掉和当前模型相关联的中间表的数据
	dr := DeleteReleated{
		ModelID: delete.ModelID,
		AppDB:   delete.AppDB,
		UserID:  delete.UserID,
		IdList:  idList,
	}
	errorCode = dr.Execute(dataRepository, tx)

	return &result, errorCode
}

func (delete *Delete) Execute(dataRepository DataRepository) (*map[string]interface{}, int) {
	//开启事务
	tx, err := dataRepository.Begin()
	if err != nil {
		slog.Error(err.Error())
		return nil, common.ResultSQLError
	}
	//执行删除动作
	result, errorCode := delete.delete(dataRepository, tx)
	if errorCode == common.ResultSuccess {
		//提交事务
		if err := tx.Commit(); err != nil {
			slog.Error(err.Error())
			errorCode = common.ResultSQLError
		}
	} else {
		tx.Rollback()
	}
	return result, errorCode
}
