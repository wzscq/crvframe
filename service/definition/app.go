package definition

import (
	"os"
	"log/slog"
	"encoding/json"
	"crv/frame/common"
)

func GetAPPConf(appDB,userID,userRoles string)(map[string]interface{},*common.CommonError){
	confFile := "apps/"+appDB+"/app.json"
	filePtr, err := os.Open(confFile)
	if err != nil {
		slog.Error("Open file failed","error",err)
		params:=map[string]interface{}{
			"configure file:":confFile,
		}
		return nil,common.CreateError(common.ResultOpenFileError,params)
	}
	defer filePtr.Close()
	//创建json解码器
	decoder := json.NewDecoder(filePtr)
	appConf:=map[string]interface{}{}
	err = decoder.Decode(&appConf)
	if err != nil {
		slog.Error("json file decode failed", "error",err)
		params:=map[string]interface{}{
			"configure file:":confFile,
		}
		return nil,common.CreateError(common.ResultJsonDecodeError,params)
	}

	//filter by userRoles
	//GetGlobalFilterFormInitData(&appConf,appDB,userID,userRoles)

	return appConf,nil
}

/*func GetGlobalFilterFormInitData(appConf *map[string]interface{},appDB,userID,userRoles string){
	filterForm,ok:=(*appConf)["filterForm"]
	if !ok {
		slog.Debug("GetGlobalFilterFormInitData no filterForm")
		return
	}
	filterFormMap,ok:=filterForm.(map[string]interface{})
	if !ok {
		slog.Debug("GetGlobalFilterFormInitData filterForm is not map[string]interface{}")
		return
	}
	initData,ok:=filterFormMap["initData"]
	if !ok {
		slog.Debug("GetGlobalFilterFormInitData no initData")
		return
	}
	initDataMap,ok:=initData.(map[string]interface{})
	if !ok {
		slog.Debug("GetGlobalFilterFormInitData initData is not map[string]interface{}")
		return
	}



}

func ConverInitDataMapToFilterDataItem(initDataMap map[string]interface{})*data.FilterDataItem{

}*/

func GetOperations(appDB,userRoles string)([]OperationConf){
	confFile := "apps/"+appDB+"/operations.json"
	filePtr, err := os.Open(confFile)
	if err != nil {
		slog.Error("Open file failed","error",err)
		return nil
	}
	defer filePtr.Close()

	//创建json解码器
	decoder := json.NewDecoder(filePtr)
	operations:=[]OperationConf{}
	err = decoder.Decode(&operations)
	if err != nil {
		slog.Error("json file decode failed","error", err)
		return nil
	}

	//filter by userRoles
	operations=GetUserOperations(operations,userRoles)	
			
	return operations
}
