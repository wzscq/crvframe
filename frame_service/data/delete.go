package data

import (
	"crv/frame/common"
	"crv/frame/definition"
	"log"
	"database/sql"
)

type Delete struct {
	ModelID string `json:"modelID"`
	SelectedRowKeys *[]string `json:"selectedRowKeys"` 
	AppDB string `json:"appDB"`
	UserID string `json:"userID"`
	UserRoles string `json:"userRoles"`
}

func (delete *Delete)getPermissionIds(dataRepository DataRepository,idList *[]string)(string,int){
	log.Println("start getPermissionIds")
	//根据用户权限，获取允许删除数据的id列表
	permissionDataset,errorCode:=definition.GetUserDataset(delete.AppDB,delete.ModelID,delete.UserRoles,definition.DATA_OP_TYPE_MUTATION)
	if errorCode != common.ResultSuccess {
		return "",errorCode
	}

	if permissionDataset.Filter ==  nil {
		log.Println("end getPermissionIds with nil filter")
		return delete.idListToString(idList)
	}

	//查询符合条件的数据ID
	query:=&Query{
		ModelID:delete.ModelID,
		Filter:&map[string]interface{}{
			Op_and:[]interface{}{
				map[string]interface{}{
					"id":map[string]interface{}{
						Op_in:*idList,
					},
				},
				*(permissionDataset.Filter),
			},
		},
		Fields:&[]field{
			field{
				Field:"id",
			},
		},
		AppDB:delete.AppDB,
		UserRoles:delete.UserRoles,
	}
	result,errorCode:=query.Execute(dataRepository,false)

	if len(result.List) == 0 {
		log.Println("end getPermissionIds with no permission")
		return "",common.ResultNoPermission
	}
	//循环结果的每行数据
	strIDs:=""
	for _,row:=range result.List {
		strIDs=strIDs+"'"+row["id"].(string)+"',"
	}
	//去掉末尾的逗号
	strIDs=strIDs[0:len(strIDs)-1]
	log.Println("end getPermissionIds with id list : %s",strIDs)
	return strIDs,common.ResultSuccess
}

func (delete *Delete)idListToString(idList *[]string)(string,int){
	strIDs:=""
	if len(*idList)<=0 {
		return "",common.ResultNoIDWhenDelete
	}

	for _, strID := range *idList {
		strIDs=strIDs+"'"+strID+"',"
	}
	//去掉末尾的逗号
	strIDs=strIDs[0:len(strIDs)-1]

	return strIDs,common.ResultSuccess
}

func (delete *Delete) delete(dataRepository DataRepository,tx *sql.Tx,modelID string,idList *[]string)(*map[string]interface {},int) {
	//获取所有待删数据ID列表字符串，类似：'id1','id2'
	strIDs,errorCode:=delete.getPermissionIds(dataRepository,idList)
	if errorCode!=common.ResultSuccess {
		return nil,errorCode
	}

	sql:="delete from "+delete.AppDB+"."+modelID+" where id in ("+strIDs+")"

	_,rowCount,err:=dataRepository.execWithTx(sql,tx)
	if err != nil {
		return nil,common.ResultSQLError
	}
	result := map[string]interface{}{}		
	result["count"]=rowCount
	result["modelID"]=modelID

	//还要删掉和当前模型相关联的中间表的数据
	dr:=DeleteReleated{
		ModelID:modelID,
		AppDB:delete.AppDB,
		UserID:delete.UserID,
		IdList:idList,
	}
	errorCode=dr.Execute(dataRepository,tx)

	return &result,errorCode
}

func (delete *Delete) Execute(dataRepository DataRepository)(*map[string]interface {},int) {
	//开启事务
	tx,err:= dataRepository.begin()
	if err != nil {
		log.Println(err)
		return nil,common.ResultSQLError
	}
	//执行删除动作
	result,errorCode:=delete.delete(dataRepository,tx,delete.ModelID,delete.SelectedRowKeys)
	if errorCode == common.ResultSuccess {
		//提交事务
		if err := tx.Commit(); err != nil {
			log.Println(err)
			errorCode=common.ResultSQLError
		}
	} else {
		tx.Rollback()
	}
	return result,errorCode
}

