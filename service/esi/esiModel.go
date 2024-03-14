package esi

import (
	"crv/frame/common"
	"encoding/json"
	"io/ioutil"
	"log/slog"
	"os"
	"strings"
)

const (
	EXCEL_RANGE_TABLE    = "table"
	EXCEL_RANGE_RIGHTVAL = "rightVal"
	EXCEL_RANGE_AUTO     = "auto"
)

const (
	DATA_SOURCE_INPUT = "input"
)

const (
	END_ROW_YES  = "yes"
	END_ROW_NO   = "no"
	END_ROW_AUTO = "auto"
)

const (
	EMPTY_VALUE_YES = "yes"
	EMPTY_VALUE_NO  = "no"
)

const (
	SHEETSELECTOR_OPTIONAL_YES = "yes"
	SHEETSELECTOR_OPTIONAL_NO  = "no"
)

const (
	SHEETSELECTOR_TYPE_INDEX = "index"
	SHEETSELECTOR_TYPE_NAME  = "name"
)

type SheetSelector struct {
	Type     string `json:"type"`
	Value    string `json:"value"`
	Optional string `json:"optional"`
}

type esiModelField struct {
	Field             string `json:"field"`
	LabelRegexp       string `json:"labelRegexp"`
	ExcelRangeType    string `json:"excelRangeType"`
	EndRow            string `json:"endRow"`
	EmptyValue        string `json:"emptyValue"`
	DetectedRangeType string `json:"detectedRangeType"`
	Source            string `json:"source"`
}

type esiOption struct {
	GenerateRowID bool `json:"generateRowID"`
	MaxHeaderRow  int  `json:"maxHeaderRow"`
}

type esiModelSpec struct {
	ModelID        string          `json:"modelID"`
	Fields         []esiModelField `json:"fields"`
	Options        esiOption       `json:"options"`
	FileField      string          `json:"fileField"`
	SheetSelectors []SheetSelector `json:"sheets"`
	SpecificID     string          `json:"specificID"`
}

type esiModel struct {
	ModelID        string          `json:"modelID"`
	Fields         []esiModelField `json:"fields"`
	Options        esiOption       `json:"options"`
	FileField      string          `json:"fileField"`
	SheetSelectors []SheetSelector `json:"sheets"`
}

func getAppEsiModels(appDB string) (*[]string, *common.CommonError) {
	//flow path
	esiModelConfPath := "apps/" + appDB + "/esimodels/"
	confDir, err := os.Open(esiModelConfPath)
	if err != nil {
		slog.Error("Open esimodels configuration folder failed", "error", err)
		commonErr := common.CreateError(
			common.ResultOpenFileError,
			map[string]interface{}{
				"fileName":   confDir,
				"orignalErr": err.Error(),
			})
		return nil, commonErr
	}
	defer confDir.Close()

	confFiles, err := confDir.Readdir(0)
	if err != nil {
		slog.Error("Read esimodels configuration folder failed ", "error", err)
		commonErr := common.CreateError(
			common.ResultOpenFileError,
			map[string]interface{}{
				"fileName":   confDir,
				"orignalErr": err.Error(),
			})
		return nil, commonErr
	}
	// Loop over files.
	if len(confFiles) <= 0 {
		return nil, nil
	}

	esiModels := make([]string, len(confFiles))
	for index := range confFiles {
		confFile := confFiles[index]
		modelID := confFile.Name()
		if strings.Contains(modelID, ".json") {
			modelID = modelID[:len(modelID)-5]
		}
		esiModels[index] = modelID
	}
	return &esiModels, nil
}

func getAppEsiModelSpecifics(appDB, modelID string) (*[]string, *common.CommonError) {
	//flow path
	esiModelSpecPath := "apps/" + appDB + "/esimodels/" + modelID + "/specifics"
	specDir, err := os.Open(esiModelSpecPath)
	if err != nil {
		slog.Error("Open esimodels configuration folder failed ", "error", err)
		commonErr := common.CreateError(
			common.ResultOpenFileError,
			map[string]interface{}{
				"fileName":   specDir,
				"orignalErr": err.Error(),
			})
		return nil, commonErr
	}
	defer specDir.Close()

	confFiles, err := specDir.Readdir(0)
	if err != nil {
		slog.Error("Read esimodels configuration folder failed", "error", err)
		commonErr := common.CreateError(
			common.ResultOpenFileError,
			map[string]interface{}{
				"fileName":   specDir,
				"orignalErr": err.Error(),
			})
		return nil, commonErr
	}
	// Loop over files.
	if len(confFiles) <= 0 {
		return nil, nil
	}

	esiModelSpecs := make([]string, len(confFiles))
	for index := range confFiles {
		confFile := confFiles[index]
		specID := confFile.Name()
		if strings.Contains(specID, ".json") {
			specID = specID[:len(specID)-5]
		}
		esiModelSpecs[index] = specID
	}
	return &esiModelSpecs, nil
}

func loadESIModel(appDB string, modelID string) (*esiModel, *common.CommonError) {
	modelFile := "apps/" + appDB + "/esimodels/" + modelID + "/" + modelID + ".json"
	filePtr, err := os.Open(modelFile)
	if err != nil {
		slog.Error("Open file failed", "error", err)
		commonErr := common.CreateError(
			common.ResultOpenFileError,
			map[string]interface{}{
				"fileName":   modelFile,
				"orignalErr": err.Error(),
			})
		return nil, commonErr
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	esiModel := esiModel{}
	err = decoder.Decode(&esiModel)
	if err != nil {
		slog.Error("json file decode failed", "error", err)
		commonErr := common.CreateError(
			common.ResultOpenFileError,
			map[string]interface{}{
				"fileName":   modelFile,
				"orignalErr": err.Error(),
			})
		return nil, commonErr
	}

	return &esiModel, nil
}

func loadESIModelSpec(appDB string, modelID, specID string) (*esiModelSpec, *common.CommonError) {
	specFile := "apps/" + appDB + "/esimodels/" + modelID + "/specifics/" + specID + ".json"
	filePtr, err := os.Open(specFile)
	if err != nil {
		slog.Error("Open file failed", "error", err)
		commonErr := common.CreateError(
			common.ResultOpenFileError,
			map[string]interface{}{
				"fileName":   specFile,
				"orignalErr": err.Error(),
			})
		return nil, commonErr
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	esiModelSpec := esiModelSpec{}
	err = decoder.Decode(&esiModelSpec)
	if err != nil {
		slog.Error("json file decode failed", "error", err)
		commonErr := common.CreateError(
			common.ResultOpenFileError,
			map[string]interface{}{
				"fileName":   specFile,
				"orignalErr": err.Error(),
			})
		return nil, commonErr
	}

	return &esiModelSpec, nil
}

func saveESIModelSpec(appDB string, esiModelSpec *esiModelSpec) *common.CommonError {
	jsonStr, err := json.MarshalIndent(esiModelSpec, "", "    ")
	if err != nil {
		slog.Error(err.Error())
	} else {
		modelFile := "apps/" + appDB + "/esimodels/" + esiModelSpec.ModelID + "/specifics/" + esiModelSpec.SpecificID + ".json"
		ioutil.WriteFile(modelFile, jsonStr, 0644)
	}
	return nil
}
