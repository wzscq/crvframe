package esi

import (
	"crv/frame/common"
	"crv/frame/data"
	"log"
)

type DataRowHandler interface {
	handleRow(row map[string]interface{})(*common.CommonError)
	onInit()(*common.CommonError)
	onOver(commit bool)(*common.CommonError)
}

type esiImport struct {
	AppDB string
	ModelID string
	UserID string
	UserRoles string
	Specific string
	FileName string
	FileContent string
	DataRepository data.DataRepository
	InputRowData *map[string]interface{}
}

func (esi *esiImport)doImport()(interface{},*common.CommonError){
	log.Println("esiImport doImport start")
	esiModelSpec,err:=esi.getEsiModelSpec()
	if err!=nil {
		return nil,err
	}

	dataRowHandler:=getDataRowHandler(
		esi.AppDB,
		esi.ModelID,
		esi.UserID,
		esi.UserRoles,
		esi.FileName,
		esi.DataRepository,
		esiModelSpec,
		esi.InputRowData)

	contentHandler:=getContentHandler(esiModelSpec)

	err=dataRowHandler.onInit()
	if err!=nil {
		return nil,err
	}

	err=parseBase64File(esi.FileName,esi.FileContent,contentHandler,dataRowHandler)
	if err!=nil {
		dataRowHandler.onOver(false)
		return nil,err
	}

	err=dataRowHandler.onOver(true)
	if err!=nil {
		return nil,err
	}

	result:=map[string]interface{}{
		"count":dataRowHandler.Count,
	}
	log.Println("esiImport doImport end")
	return result,nil
}

func (esi *esiImport)getEsiModelSpec()(*esiModelSpec,*common.CommonError){
	log.Println("esiImport getEsiModelSpec start")
	var modelSpec *esiModelSpec
	var err *common.CommonError
	if len(esi.Specific)>0 {
		modelSpec,err=loadESIModelSpec(esi.AppDB,esi.ModelID,esi.Specific)
		if err!=nil {
			log.Println("esiImport getEsiModelSpec end with error:")
			log.Println("loadESIModel error")
			return nil,err
		}
	} else {
		esiModel,err:=loadESIModel(esi.AppDB,esi.ModelID)
		if err!=nil {
			log.Println("esiImport getEsiModelSpec end with error:")
			log.Println("loadESIModelSpec error")
			return nil,err 
		}
		modelSpec=&esiModelSpec{
			ModelID:esi.ModelID,
			Fields:esiModel.Fields,
			Options:esiModel.Options,
			SpecificID:"",
		}
	}
	log.Println("esiImport getEsiModelSpec end")
	return modelSpec,nil
}

