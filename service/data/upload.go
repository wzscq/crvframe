package data

import (
	"crv/frame/common"
	"log/slog"
)

type UploadHandler struct {
	UploadCache UploadCache
}

func (handler *UploadHandler) GetUploadKey(appDB string, userID string) (string, error) {
	key := GetBatchID()
	err := handler.UploadCache.SaveUploadKey(key, appDB, userID)
	if err != nil {
		slog.Error(err.Error())
		return "", err
	}
	return key, nil
}

func (handler *UploadHandler) GetSaveFileName(key, name string) (string, error) {
	appDB, err := handler.UploadCache.GetUploadAppDB(key)
	if err != nil {
		slog.Error(err.Error())
		return "", err
	}

	userID, err := handler.UploadCache.GetUploadUser(key)
	if err != nil {
		slog.Error(err.Error())
		return "", err
	}

	//handler.UploadCache.RemoveUploadKey(key)

	return common.GetConfig().File.Root + "/upload/" + appDB + "_" + userID + "_" + key + "_" + name, nil
}
