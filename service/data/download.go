package data

import (
	//"crv/frame/common"
	"log/slog"
)

type DownloadHandler struct {
	DownloadCache DownloadCache
}

func (download *DownloadHandler) GetDownloadKey(fileName string, orgName string) (string, error) {
	key := GetBatchID()
	err := download.DownloadCache.SaveDownloadKey(key, fileName, orgName)
	if err != nil {
		slog.Error(err.Error())
		return "", err
	}
	return key, nil
}

func (download *DownloadHandler) GetDownloadFileName(key string) (string, string, error) {
	fileName, err := download.DownloadCache.GetDownloadFileName(key)
	if err != nil {
		slog.Error(err.Error())
		return "", "", err
	}

	orgName, err := download.DownloadCache.GetOrgFileName(key)
	if err != nil {
		slog.Error(err.Error())
		return "", "", err
	}

	download.DownloadCache.RemoveDownloadKey(key)
	return fileName, orgName, nil
}
