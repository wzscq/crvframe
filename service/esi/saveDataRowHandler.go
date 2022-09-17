package esi

import (
	"crv/frame/data"
	"crv/frame/common"
	"log"
	"database/sql"
)

type saveDataRowHandler struct {
	AppDB string
	ModelID string
	UserID string
	UserRoles string
	DataRepository data.DataRepository
	Count int
	Tx *sql.Tx
}

func getDataRowHandler(appDB,modelID,userID,userRoles string,dataRepository data.DataRepository )(*saveDataRowHandler){
	return &saveDataRowHandler{
		AppDB:appDB,
		ModelID:modelID,
		UserID:userID,
		UserRoles:userRoles,
		DataRepository:dataRepository,
		Count:0,
		Tx:nil,
	}
}

func (saveHandler *saveDataRowHandler)onInit()(*common.CommonError){
	//开启事务
	var err error
	saveHandler.Tx,err= saveHandler.DataRepository.Begin()
	if err != nil {
		log.Println("saveDataRowHandler begin transaction error：")
		log.Println(err)
		return common.CreateError(common.ResultSQLError,nil)
	}
	return nil
}

func (saveHandler *saveDataRowHandler)onOver(commit bool)(*common.CommonError){
	if saveHandler.Tx != nil {
		if commit {
			if err := saveHandler.Tx.Commit(); err != nil {
				log.Println("saveDataRowHandler commit transaction error：")
				log.Println(err)
				return common.CreateError(common.ResultSQLError,nil)
			}
		} else {
			saveHandler.Tx.Rollback()
		}
	}
	return nil
}

func (saveHandler *saveDataRowHandler)handleRow(row map[string]interface{})(*common.CommonError){
	log.Println("saveDataRowHandler handleRow start")
	saveHandler.Count++
	row[data.SAVE_TYPE_COLUMN]=data.SAVE_CREATE
	save:=&data.Save{
		ModelID:saveHandler.ModelID,
		AppDB:saveHandler.AppDB,
		UserID:saveHandler.UserID,
		List:&[]map[string]interface{}{row},
		UserRoles:saveHandler.UserRoles,
	}
	//执行保存动作
	result,errorCode:=save.SaveList(saveHandler.DataRepository,saveHandler.Tx)
	if errorCode!=common.ResultSuccess {
		log.Println("saveDataRowHandler handleRow save.Execute error.",result)
		return common.CreateError(errorCode,nil)
	}
	log.Println("saveDataRowHandler handleRow end")
	return nil
}



