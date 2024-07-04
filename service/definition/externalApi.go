package definition

import (
	"crv/frame/common"
	"encoding/json"
	"log/slog"
	"os"
	"strings"
)

type apiItem struct {
	Url string `json:"url"`
	Rolse *[]string `json:"roles"`
}

func GetApiConfig(appDB, apiId string) (map[string]interface{}, int) {
	slog.Debug("start getApiConfig ")
	apiConfigFile := "apps/" + appDB + "/external_api.json"
	filePtr, err := os.Open(apiConfigFile)
	if err != nil {
		slog.Error("Open file failed", "error", err)
		return nil, common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	apiConf := map[string]interface{}{}
	err = decoder.Decode(&apiConf)
	if err != nil {
		slog.Error("json file decode failed", "error", err)
		return nil, common.ResultJsonDecodeError
	}

	api, ok := apiConf[apiId]
	if !ok {
		slog.Error("ResultNoExternalApiUrl")
		return nil, common.ResultNoExternalApiUrl
	}
	slog.Debug("end getApiConfig ", "url", api)
	return api.(map[string]interface{}), common.ResultSuccess
}

func GetApiUrl(appDB, apiId,userRoles string) (string, int) {
	slog.Debug("start getApiUrl ")
	apiConfigFile := "apps/" + appDB + "/external_api.json"
	filePtr, err := os.Open(apiConfigFile)
	if err != nil {
		slog.Error("Open file failed", "error", err)
		return "", common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	apiConf := map[string]apiItem{}
	err = decoder.Decode(&apiConf)
	if err != nil {
		slog.Error("json file decode failed", "error", err)
		return "", common.ResultJsonDecodeError
	}

	api, ok := apiConf[apiId]
	if !ok {
		slog.Error("ResultNoExternalApiUrl")
		return "", common.ResultNoExternalApiUrl
	}

	if api.Rolse != nil && len(*api.Rolse) > 0 {
		userRoles = "," + userRoles + ","
		for _,role := range *api.Rolse {
			if strings.Contains(userRoles, ","+role+",") {
				return api.Url,common.ResultSuccess
			}
		}
		return "",common.ResultNoPermission
	}
	
	slog.Debug("end getApiUrl ", "url", api.Url)
	return api.Url, common.ResultSuccess
}
