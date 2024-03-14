package data

import (
	"crv/frame/common"
	"database/sql"
	"log/slog"
)

type SaveOneToMany struct {
	AppDB     string `json:"appDB"`
	UserID    string `json:"userID"`
	UserRoles string `json:"userRoles"`
}

func (save *SaveOneToMany) save(pID string, dataRepository DataRepository, tx *sql.Tx, modelID string, fieldValue map[string]interface{}) int {
	slog.Debug("start SaveOneToMany save ... ")
	relatedModel, ok := fieldValue["modelID"]
	if !ok {
		return common.ResultNoRelatedModel
	}
	relatedModelID := relatedModel.(string)

	relatedField, ok := fieldValue["relatedField"]
	if !ok {
		return common.ResultNoRelatedField
	}
	relatedFieldID := relatedField.(string)

	mapList, ok := fieldValue["list"]
	if !ok {
		slog.Error("SaveOneToMany end with error: no list field")
		return common.ResultSuccess
	}

	list, ok := mapList.([]interface{})
	if !ok || len(list) <= 0 {
		slog.Error("SaveOneToMany end with error：empty list")
		return common.ResultSuccess
	}

	//更新数据中的关联字段值为父记录ID
	rowList := []map[string]interface{}{}
	for _, row := range list {
		mapRow := row.(map[string]interface{})
		if SAVE_CREATE == mapRow[SAVE_TYPE_COLUMN] {
			mapRow[relatedFieldID] = pID
		}
		rowList = append(rowList, mapRow)
	}

	slog.Debug("save", "rowList", rowList)

	//调用单表保存数据逻辑
	saveRows := &Save{
		ModelID:   relatedModelID,
		AppDB:     save.AppDB,
		UserID:    save.UserID,
		List:      &rowList,
		UserRoles: save.UserRoles,
	}
	_, errorCode := saveRows.SaveList(dataRepository, tx)
	slog.Debug("end SaveOneToMany save")
	return errorCode
}
