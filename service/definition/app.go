package definition

import (
	"crv/frame/common"
	"encoding/json"
	"log/slog"
	"os"
)

func GetAPPConf(appDB string) (*map[string]interface{}, *common.CommonError) {
	confFile := "apps/" + appDB + "/app.json"
	filePtr, err := os.Open(confFile)
	if err != nil {
		slog.Error("Open file failed", "error", err)
		params := map[string]interface{}{
			"configure file:": confFile,
		}
		return nil, common.CreateError(common.ResultOpenFileError, params)
	}
	defer filePtr.Close()
	//创建json解码器
	decoder := json.NewDecoder(filePtr)
	appConf := map[string]interface{}{}
	err = decoder.Decode(&appConf)
	if err != nil {
		slog.Error("json file decode failed", "error", err)
		params := map[string]interface{}{
			"configure file:": confFile,
		}
		return nil, common.CreateError(common.ResultJsonDecodeError, params)
	}

	return &appConf, nil
}

func GetOperations(appDB, userRoles string) []OperationConf {
	confFile := "apps/" + appDB + "/operations.json"
	filePtr, err := os.Open(confFile)
	if err != nil {
		slog.Error("Open file failed", "error", err)
		return nil
	}
	defer filePtr.Close()

	//创建json解码器
	decoder := json.NewDecoder(filePtr)
	operations := []OperationConf{}
	err = decoder.Decode(&operations)
	if err != nil {
		slog.Error("json file decode failed", "error", err)
		return nil
	}

	//filter by userRoles
	operations = GetUserOperations(operations, userRoles)

	return operations
}
