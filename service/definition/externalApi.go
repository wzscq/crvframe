package definition

import (
	"os"
	"log"
	"encoding/json"
	"crv/frame/common"
)

type apiItem struct {
	Url string `json:"url"`
}

func GetApiUrl(appDB,apiId string)(string,int){
	log.Println("start getApiUrl ")
	apiConfigFile := "apps/"+appDB+"/external_api.json"
	filePtr, err := os.Open(apiConfigFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return "",common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	apiConf:=map[string]apiItem{}
	err = decoder.Decode(&apiConf)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return "",common.ResultJsonDecodeError
	}

	api,ok:=apiConf[apiId]
	if !ok {
		return "",common.ResultNoExternalApiUrl
	}
	log.Println("end getApiUrl ",api.Url)
	return api.Url,common.ResultSuccess
}