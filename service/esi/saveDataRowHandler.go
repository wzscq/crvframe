package esi

import (
	"crv/frame/data"
	"crv/frame/common"
	"log"
	"database/sql"
	"github.com/rs/xid"
	"fmt"
)

const (
	CC_BATCH_NUMBER="import_batch_number"
	CC_IMPORT_FILE="import_file_name"
)

type saveDataRowHandler struct {
	AppDB string
	ModelID string
	UserID string
	UserRoles string
	FileName string
	ESIModel *esiModelSpec
	DataRepository data.DataRepository
	Count int
	Tx *sql.Tx
	InputRowData *map[string]interface{}
	BatchID string
}

func getDataRowHandler(
	appDB,modelID,userID,userRoles,fileName string,
	dataRepository data.DataRepository,
	esiModel *esiModelSpec,
	inputRowData *map[string]interface{} )(*saveDataRowHandler){
	return &saveDataRowHandler{
		AppDB:appDB,
		ModelID:modelID,
		UserID:userID,
		FileName:fileName,
		UserRoles:userRoles,
		DataRepository:dataRepository,
		Count:0,
		Tx:nil,
		ESIModel:esiModel,
		InputRowData:inputRowData,
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
	saveHandler.BatchID=saveHandler.getBatchID()
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

func (saveHandler *saveDataRowHandler)getRowID(batchID string)(string){
	return fmt.Sprintf("%s%05d",batchID,saveHandler.Count)
}

func (saveHandler *saveDataRowHandler)getBatchID()(string){
	guid := xid.New().String()
	return guid
}

func (saveHandler *saveDataRowHandler)updateRowData(row *map[string]interface{}){
	(*row)[data.SAVE_TYPE_COLUMN]=data.SAVE_CREATE
	//从表单输入的数据写入导入记录对应字段上
	for fidx,_:=range(saveHandler.ESIModel.Fields) {
		esiField:=&saveHandler.ESIModel.Fields[fidx]
		if esiField.Source==DATA_SOURCE_INPUT {
			(*row)[esiField.Field]=(*saveHandler.InputRowData)[esiField.Field]
		}
	}
	//生成导入文件名+ID+批次号
	batchID:=saveHandler.BatchID
	(*row)[CC_BATCH_NUMBER]=batchID
	(*row)[CC_IMPORT_FILE]=saveHandler.FileName
	if saveHandler.ESIModel.Options.GenerateRowID == true {
		(*row)[data.CC_ID]=saveHandler.getRowID(batchID)
	}
	
}

func (saveHandler *saveDataRowHandler)handleRow(row map[string]interface{})(*common.CommonError){
	log.Println("saveDataRowHandler handleRow start")
	saveHandler.Count++
	saveHandler.updateRowData(&row)
	
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


