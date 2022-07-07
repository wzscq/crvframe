package data

import (
	"crv/frame/common"
	"database/sql"
	"log"
)

type SaveManyToMany struct {
	AppDB string `json:"appDB"`
	UserID string `json:"userID"`
}

func (save *SaveManyToMany)save(pID string,dataRepository DataRepository,tx *sql.Tx,modelID string,fieldValue map[string]interface{})(int){
	log.Println("start SaveManyToMany save ... ")
	relatedModel,ok:=fieldValue["modelID"]
	if !ok {
		return common.ResultNoRelatedModel
	}
	relatedModelID:=relatedModel.(string)
	mapList,ok:=fieldValue["list"]
	if !ok {
		log.Println("saveManyToManyField end ")
		return common.ResultSuccess
	}

	list,ok:=mapList.([]interface{})
	if !ok || len(list)<=0 {
		log.Println("saveManyToManyField end ")
		return common.ResultSuccess
	}

	//指定了关联中间表的名称
	var associationModelID *string
	associationModel,ok:=fieldValue["associationModelID"]
	if ok {
		associationModel:=associationModel.(string)
		associationModelID=&associationModel
	} else {
		associationModelID=nil
	}

	for _,row:=range list {
		mapRow,ok:=row.(map[string]interface{})
		if(!ok){
			continue
		}
		errorCode:=save.saveManyToManyRow(dataRepository,tx,modelID,pID,relatedModelID,associationModelID,mapRow)
		if errorCode!=common.ResultSuccess {
			return errorCode
		}
	}

	log.Println("end SaveManyToMany save")
	return common.ResultSuccess
}

func (save *SaveManyToMany)saveManyToManyRow(
	dataRepository DataRepository,
	tx *sql.Tx,
	modelID,pID,relatedModelID string,
	associationModelID *string,
	row map[string]interface{})(int){

	rowID:=row[CC_ID]
	if rowID==nil {
		return common.ResultNoIDWhenUpdate
	}

	releatedID, ok := rowID.(string)
	if !ok || len(releatedID)<=0 {
		return common.ResultNoIDWhenUpdate
	}

	saveType:=row[SAVE_TYPE_COLUMN]
	switch saveType {
		case SAVE_CREATE:
			return save.createManyToManyRow(dataRepository,tx,modelID,pID,relatedModelID,releatedID,associationModelID)
		case SAVE_DELETE:
			return save.deleteManyToManyRow(dataRepository,tx,modelID,pID,relatedModelID,releatedID,associationModelID)
		default:
			return common.ResultNotSupportedSaveType
	}
}

func (save *SaveManyToMany)createManyToManyRow(
	dataRepository DataRepository,
	tx *sql.Tx,
	modelID,pID,relatedModelID,releatedID string,
	associationModelID *string)(int){
	
	log.Println("createManyToManyRow ... ")
	
	midModelID:=getRelatedModelID(modelID,relatedModelID,associationModelID)
	columns:=modelID+"_id,"+relatedModelID+"_id,"
	values:="'"+pID+"','"+releatedID+"',"
	commonFields,commonFieldsValue:=GetCreateCommonFieldsValues(save.UserID)
	columns=columns+commonFields
	values=values+commonFieldsValue
	sql:="insert into "+save.AppDB+"."+midModelID+" ("+columns+") values ("+values+")"
	//执行sql
	_,_,err:=dataRepository.execWithTx(sql,tx)
	if err != nil {
		return common.ResultSQLError
	}
	log.Println("createManyToManyRow end ")
	return common.ResultSuccess
}

func (save *SaveManyToMany)deleteManyToManyRow(
	dataRepository DataRepository,
	tx *sql.Tx,
	modelID,pID,relatedModelID,releatedID string,
	associationModelID *string)(int){
	
	midModelID:=getRelatedModelID(modelID,relatedModelID,associationModelID)
	where:=modelID+"_id='"+pID+"' and "+relatedModelID+"_id='"+releatedID+"'"
	sql:="delete from "+save.AppDB+"."+midModelID+" where "+where
	//执行sql
	_,_,err:=dataRepository.execWithTx(sql,tx)
	if err != nil {
		return common.ResultSQLError
	}
	return common.ResultSuccess
}

