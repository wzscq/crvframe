package data

import (
	"crv/frame/common"
	"crv/frame/definition"
	"database/sql"
	"log/slog"
)

type BatchDelete struct {
	ModelID         string    `json:"modelID"`
	SelectedRowKeys *[]string `json:"selectedRowKeys"`
	AppDB           string    `json:"appDB"`
	UserID          string    `json:"userID"`
	UserRoles       string    `json:"userRoles"`
	Filter     *map[string]interface{} `json:"filter"`
	SelectAll        bool     `json:"selectedAll"`
	Fields     *[]Field       `json:"fields"`
}

func (delete *BatchDelete) getWhere(dataRepository DataRepository) (string, int) {
	permissionDataset, errorCode := definition.GetUserDataset(delete.AppDB, delete.ModelID, delete.UserRoles, definition.DATA_OP_TYPE_MUTATION)
	if errorCode != common.ResultSuccess {
		return "", errorCode
	}

	//这是补充的代码，用于处理数据权限中的过滤条件
	if permissionDataset.Filter != nil && permissionDataset.NeedFilterProcess == true {
		var filterData *[]FilterDataItem
		if(permissionDataset.FilterData != nil){
			var err error
			filterData,err=ConvertToFileterData(permissionDataset.FilterData)
			if err != nil {
				return "", common.ResultWrongFilterDataInDataset
			}
		}

		errorCode = processFilter(
			permissionDataset.Filter,
			filterData,
			nil,
			delete.UserID,
			delete.UserRoles,
			delete.AppDB,
			dataRepository)

		if errorCode != common.ResultSuccess {
			return "", errorCode
		}
	}

	var filter *map[string]interface{}
	if permissionDataset.Filter == nil && delete.SelectAll == false {
		filter=&map[string]interface{}{
			"id": map[string]interface{}{
				Op_in: *delete.SelectedRowKeys,
			},
		}
	} else {
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
							Op_in: *delete.SelectedRowKeys,
						},
					},
					*(permissionDataset.Filter),
				},
			}
		}
	}

	return FilterToSQLWhere(filter, delete.Fields, delete.ModelID)
}

func (delete *BatchDelete) delete(dataRepository DataRepository, tx *sql.Tx) (*map[string]interface{}, int) {
	//获取所有待删数据查询条件
	sWhere,errorCode:=delete.getWhere(dataRepository)
	if errorCode != common.ResultSuccess {
		return nil, errorCode
	}

	sql := "delete from " + delete.AppDB + "." + delete.ModelID + " where " + sWhere

	_, rowCount, err := dataRepository.ExecWithTx(sql, tx)
	if err != nil {
		return nil, common.ResultSQLError
	}
	result := map[string]interface{}{}
	result["count"] = rowCount
	result["modelID"] = delete.ModelID

	return &result, errorCode
}

func (delete *BatchDelete) Execute(dataRepository DataRepository) (*map[string]interface{}, int) {
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
