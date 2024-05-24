package definition

import (
	"crv/frame/common"
	"encoding/json"
	"log/slog"
	"os"
)

type ReportControl struct {
	ID            string                 `json:"id"`
	ControlType   string                 `json:"controlType"`
	Option        map[string]interface{} `json:"option"`
	DataView      interface{}            `json:"dataView"`
	SQLParameters map[string]interface{} `json:"sqlParameters"`
	MinHeight     int                    `json:"minHeight"`
	Row           int                    `json:"row"`
	Col           int                    `json:"col"`
	ColSpan       int                    `json:"colSpan"`
	RowSpan       int                    `json:"rowSpan"`
}

type ReportConf struct {
	ReportID   string                  `json:"reportID"`
	ColCount   int                     `json:"colCount"`
	RowHeight  int                     `json:"rowHeight"`
	Controls   []ReportControl         `json:"controls"`
	FilterForm *map[string]interface{} `json:"filterForm"`
	Theme      *map[string]interface{} `json:"theme"`
	HeaderButtons []map[string]interface{} `json:"headerButtons"`
}

type ReportControlQueryOption struct {
	Controls []ReportControlQuery `json:"controls"`
}

type ReportControlQuery struct {
	Query interface{} `json:"query"`
	ID    string      `json:"id"`
	Option     *ReportControlQueryOption `json:"option"`
}

type ReportQueryConf struct {
	ReportID string               `json:"reportID"`
	Controls []ReportControlQuery `json:"controls"`
}

func getReportConf(appDB, reportID string) (*ReportConf, int) {
	var reportConf ReportConf
	confFile := "apps/" + appDB + "/reports/" + reportID + ".json"
	filePtr, err := os.Open(confFile)
	if err != nil {
		slog.Error("Open file failed", "error", err)
		return nil, common.ResultOpenFileError
	}
	defer filePtr.Close()
	//创建json解码器
	decoder := json.NewDecoder(filePtr)
	err = decoder.Decode(&reportConf)
	if err != nil {
		slog.Error("json file decode failed", "error", err)
		return nil, common.ResultJsonDecodeError
	}

	return &reportConf, common.ResultSuccess
}

func GetReportQuery(appDB, reportID, controlID,parentID string) (interface{}, *common.CommonError) {
	var reportConf ReportQueryConf
	confFile := "apps/" + appDB + "/reports/" + reportID + ".json"
	filePtr, err := os.Open(confFile)
	if err != nil {
		slog.Error("Open file failed [Err:%s]", err.Error())
		params := map[string]interface{}{
			"configure file:": confFile,
		}
		return "", common.CreateError(common.ResultOpenFileError, params)
	}
	defer filePtr.Close()
	//创建json解码器
	decoder := json.NewDecoder(filePtr)
	err = decoder.Decode(&reportConf)
	if err != nil {
		slog.Error("json file decode failed", "error", err)
		params := map[string]interface{}{
			"configure file:": confFile,
		}
		return "", common.CreateError(common.ResultJsonDecodeError, params)
	}

	for _, control := range reportConf.Controls {
		if control.ID == controlID {
			return control.Query, nil
		}

		if control.ID == parentID {
			return GetChildQuery(control, controlID, parentID)
		}
	}

	params := map[string]interface{}{
		"controlID:": controlID,
		"parentID:": parentID,
	}
	return "", common.CreateError(common.ResultNoReportControl, params)
}

func GetChildQuery(control ReportControlQuery, controlID,parentID string) (interface{}, *common.CommonError) {
	if(control.Option != nil && control.Option.Controls != nil){
		for _, childControl := range control.Option.Controls {
			if childControl.ID == controlID {
				return childControl.Query, nil
			}
		}
	}
	
	params := map[string]interface{}{
		"controlID:": controlID,
		"parentID:": parentID,
	}
	return "", common.CreateError(common.ResultNoReportControl, params)
}


