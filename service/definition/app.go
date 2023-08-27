package definition

import (
	"os"
	"log"
	"encoding/json"
	"crv/frame/common"
)

func GetAPPConf(appDB string)(map[string]interface{},*common.CommonError){
	confFile := "apps/"+appDB+"/app.json"
	filePtr, err := os.Open(confFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
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
		log.Println("json file decode failed [Err:%s]", err.Error())
		params:=map[string]interface{}{
			"configure file:":confFile,
		}
		return nil,common.CreateError(common.ResultJsonDecodeError,params)
	}

	return appConf,nil
}

func GetOperations(appDB,userRoles string)([]OperationConf){
	confFile := "apps/"+appDB+"/operations.json"
	filePtr, err := os.Open(confFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return nil
	}
	defer filePtr.Close()

	//创建json解码器
	decoder := json.NewDecoder(filePtr)
	operations:=[]OperationConf{}
	err = decoder.Decode(&operations)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return nil
	}

	//filter by userRoles
	operations=GetUserOperations(operations,userRoles)	
			
	return operations
}
