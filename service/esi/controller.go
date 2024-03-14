package esi

import (
	"crv/frame/common"
	"crv/frame/data"
	"github.com/gin-gonic/gin"
	"log/slog"
	"net/http"
)

type commonReq struct {
	ModelID  string                   `json:"modelID,omitempty"`
	List     []map[string]interface{} `json:"list,omitempty"`
	Specific string                   `json:"specific,omitempty"`
}

type EsiController struct {
	DataRepository data.DataRepository
}

func (controller *EsiController) getImportFile(inputRowData *map[string]interface{}) (string, string, int) {
	fileField, ok := (*inputRowData)["esiFile"]
	if !ok {
		slog.Error("EsiController getImportFile end with error:")
		slog.Error("the field esiFile is not found.")
		return "", "", common.ResultWrongRequest
	}

	fileValueMap, ok := fileField.(map[string]interface{})
	if !ok {
		slog.Error("EsiController getImportFile end with error:")
		slog.Error("can not onvert esiFile value to map[stirng]interface{}.")
		return "", "", common.ResultWrongRequest
	}

	listField, ok := fileValueMap["list"]
	if !ok {
		slog.Error("EsiController getImportFile end with error:")
		slog.Error("the field esiFile.list is not found.")
		return "", "", common.ResultWrongRequest
	}

	esiFileList, ok := listField.([]interface{})
	if !ok {
		slog.Error("EsiController getImportFile end with error:")
		slog.Error("can not onvert esiFile.list to []interface{}.")
		return "", "", common.ResultWrongRequest
	}

	if len(esiFileList) == 0 {
		slog.Error("EsiController getImportFile end with error:")
		slog.Error("esiFile.list is empty.")
		return "", "", common.ResultWrongRequest
	}

	esiFileRow, ok := esiFileList[0].(map[string]interface{})
	if !ok {
		slog.Error("EsiController getImportFile end with error:")
		slog.Error("can not onvert esiFile.list[0] to map[stirng]interface{}.")
		return "", "", common.ResultWrongRequest
	}

	//拿到文件名和文件内容
	fileNameIntreface, ok := esiFileRow["name"]
	if !ok {
		slog.Error("EsiController getImportFile end with error:")
		slog.Error("the field esiFile.list[0].name is not found.")
		return "", "", common.ResultWrongRequest
	}
	fileName, ok := fileNameIntreface.(string)
	if !ok {
		slog.Error("EsiController getImportFile end with error:")
		slog.Error("can not onvert esiFile.list[0].name to string.")
		return "", "", common.ResultWrongRequest
	}

	fileContentInterface, ok := esiFileRow["contentBase64"]
	if !ok {
		slog.Error("EsiController getImportFile end with error:")
		slog.Error("the field esiFile.list[0].contentBase64 is not found.")
		return "", "", common.ResultWrongRequest
	}
	fileContent, ok := fileContentInterface.(string)
	if !ok {
		slog.Error("EsiController getImportFile end with error:")
		slog.Error("can not onvert esiFile.list[0].contentBase64 to string.")
		return "", "", common.ResultWrongRequest
	}

	return fileName, fileContent, common.ResultSuccess
}

func (controller *EsiController) checkImportFile(appDB, modelID, fileName string) int {
	query := &data.Query{
		ModelID: modelID,
		Pagination: &data.Pagination{
			Current:  1,
			PageSize: 1,
		},
		Filter: &map[string]interface{}{
			CC_IMPORT_FILE: fileName,
		},
		Fields: &[]data.Field{
			data.Field{
				Field: data.CC_ID,
			},
		},
		AppDB: appDB,
	}
	result, err := query.Execute(controller.DataRepository, false)
	if err != common.ResultSuccess {
		return err
	}
	if result.Total > 0 {
		return common.ResultESIFileAlreadyImported
	}
	return common.ResultSuccess
}

func (controller *EsiController) esiImport(c *gin.Context) {
	slog.Debug("EsiController import start")

	//获取相关参数
	userRoles := c.MustGet("userRoles").(string)
	userID := c.MustGet("userID").(string)
	appDB := c.MustGet("appDB").(string)

	var req commonReq
	var errorCode int
	if err := c.BindJSON(&req); err != nil {
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("EsiController import end with error", "error", err)
		return
	}

	if len(req.ModelID) == 0 {
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("EsiController import end with error", "error", "modelDI is nil")
		return
	}

	if len(req.List) == 0 {
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("EsiController import end with error", "error", "list is empty")
		return
	}

	//获取esiFile
	inputRowData := req.List[0]
	fileName, fileContent, errorCode := controller.getImportFile(&inputRowData)
	if errorCode != common.ResultSuccess {
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("EsiController import end with error", "error", "getImportFile error")
		return
	}
	//检查对应的文件名称如果已经导入过则不允许导入
	errorCode = controller.checkImportFile(appDB, req.ModelID, fileName)
	if errorCode != common.ResultSuccess {
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("EsiController import end with error", "error", "checkImportFile error")
		return
	}

	esiImport := &esiImport{
		AppDB:          appDB,
		ModelID:        req.ModelID,
		UserID:         userID,
		UserRoles:      userRoles,
		Specific:       req.Specific,
		FileName:       fileName,
		FileContent:    fileContent,
		DataRepository: controller.DataRepository,
		InputRowData:   &inputRowData,
	}

	result, commonErr := esiImport.doImport()
	rsp := common.CreateResponse(commonErr, result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("EsiController import end")
}

func (controller *EsiController) Bind(router *gin.Engine) {
	slog.Info("Bind EsiController")
	router.POST("/esi/import", controller.esiImport)
}
