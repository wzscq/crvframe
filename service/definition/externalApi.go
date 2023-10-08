package definition

import (
	"os"
	"log/slog"
	"encoding/json"
	"crv/frame/common"
)

type apiItem struct {
	Url string `json:"url"`
}

func GetApiUrl(appDB,apiId string)(string,int){
	slog.Debug("start getApiUrl ")
	apiConfigFile := "apps/"+appDB+"/external_api.json"
	filePtr, err := os.Open(apiConfigFile)
	if err != nil {
		slog.Error("Open file failed","error",err)
		return "",common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	apiConf:=map[string]apiItem{}
	err = decoder.Decode(&apiConf)
	if err != nil {
		slog.Error("json file decode failed","error",err)
		return "",common.ResultJsonDecodeError
	}

	api,ok:=apiConf[apiId]
	if !ok {
		slog.Error("ResultNoExternalApiUrl")
		return "",common.ResultNoExternalApiUrl
	}
	slog.Debug("end getApiUrl ","url",api.Url)
	return api.Url,common.ResultSuccess
}