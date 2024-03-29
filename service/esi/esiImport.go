package esi

import (
	"crv/frame/common"
	"crv/frame/data"
	"log/slog"
	"regexp"
	"strings"
)

type DataRowHandler interface {
	handleRow(row map[string]interface{}, sheetName string) *common.CommonError
	onInit() *common.CommonError
	onOver(commit bool) *common.CommonError
}

type esiImport struct {
	AppDB          string
	ModelID        string
	UserID         string
	UserRoles      string
	Specific       string
	FileName       string
	FileContent    string
	DataRepository data.DataRepository
	InputRowData   *map[string]interface{}
}

func (esi *esiImport) doImport() (interface{}, *common.CommonError) {
	slog.Debug("esiImport doImport start")
	esiModelSpec, err := esi.getEsiModelSpec()
	if err != nil {
		return nil, err
	}

	dataRowHandler := getDataRowHandler(
		esi.AppDB,
		esi.ModelID,
		esi.UserID,
		esi.UserRoles,
		esi.FileName,
		esi.DataRepository,
		esiModelSpec,
		esi.InputRowData)

	contentHandler := getContentHandler(esiModelSpec)

	err = dataRowHandler.onInit()
	if err != nil {
		return nil, err
	}

	err = parseBase64File(esi.FileName, esi.FileContent, contentHandler, dataRowHandler, esiModelSpec.SheetSelectors)
	if err != nil {
		dataRowHandler.onOver(false)
		return nil, err
	}

	err = dataRowHandler.onOver(true)
	if err != nil {
		return nil, err
	}

	result := map[string]interface{}{
		"count": dataRowHandler.Count,
	}
	slog.Debug("esiImport doImport end")
	return result, nil
}

func (esi *esiImport) getEsiModelSpec() (*esiModelSpec, *common.CommonError) {
	slog.Debug("esiImport getEsiModelSpec start")
	var modelSpec *esiModelSpec
	var err *common.CommonError
	if len(esi.Specific) > 0 {
		//判断并对specific中是需要用输入数据做替换的部分进行替换
		specific, _ := esi.replaceSpecificVar(esi.Specific)
		modelSpec, err = loadESIModelSpec(esi.AppDB, esi.ModelID, specific)
		if err != nil {
			slog.Error("esiImport getEsiModelSpec end with error", "error", "loadESIModelSpec error")
			return nil, err
		}
	} else {
		esiModel, err := loadESIModel(esi.AppDB, esi.ModelID)
		if err != nil {
			slog.Error("esiImport getEsiModelSpec end with error", "error", "loadESIModelSpec error")
			return nil, err
		}
		modelSpec = &esiModelSpec{
			ModelID:    esi.ModelID,
			Fields:     esiModel.Fields,
			Options:    esiModel.Options,
			SpecificID: "",
		}
	}
	slog.Debug("esiImport getEsiModelSpec end")
	return modelSpec, nil
}

func (esi *esiImport) replaceSpecificVar(specific string) (string, bool) {
	//识别出过滤参数中的
	slog.Debug("replaceSpecificVar start", "specific", specific)
	re := regexp.MustCompile(`%{([A-Z|a-z|_|0-9|.]*)}`)
	replaceItems := re.FindAllStringSubmatch(specific, -1)
	replaced := false
	if replaceItems != nil {
		for _, replaceItem := range replaceItems {
			repalceStr := esi.getReplaceString(replaceItem[1])
			specific = strings.Replace(specific, replaceItem[0], repalceStr, -1)
		}
		replaced = true
	}
	slog.Debug("replaceSpecificVar end", "specific", specific)
	return specific, replaced
}

func (esi *esiImport) getReplaceString(replaceItem string) string {

	if esi.InputRowData == nil {
		return replaceItem
	}

	replaceData, ok := (*esi.InputRowData)[replaceItem]
	if !ok || replaceData == nil {
		return replaceItem
	}

	replaceStr, ok := replaceData.(string)
	if !ok {
		return replaceItem
	}

	return replaceStr
}
