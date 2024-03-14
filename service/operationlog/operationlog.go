package operationlog

import (
	"crv/frame/common"
	"encoding/json"
	"gopkg.in/natefinch/lumberjack.v2"
	"sync"
)

type OplogItem struct {
	AppDB               string `json:"appDB"`
	UserID              string `json:"userID"`
	RequestTime         string `json:"requestTime"`
	ResponseTime        string `json:"responseTime"`
	Url                 string `json:"url"`
	RequestContentType  string `json:"requestContentType"`
	RequestBody         string `json:"requestBody"`
	ResponseBody        string `json:"responseBody"`
	ResponseStatus      int    `json:"responseStatus"`
	ResponseContentType string `json:"responseContentType"`
}

type OperationLog struct {
	AppLogs     map[string]*lumberjack.Logger
	Mutex       sync.Mutex
	FileOptions *common.FileOptionConf
}

var gLineSpliter = "\n"

func (opl *OperationLog) AddAppLogFile(appDB string) *lumberjack.Logger {
	opl.Mutex.Lock()
	defer opl.Mutex.Unlock()

	appLog, exist := opl.AppLogs[appDB]
	if exist {
		return appLog
	}

	appLog = opl.getAppLogFile(appDB)
	if appLog != nil {
		opl.AppLogs[appDB] = appLog
	}

	return appLog
}

func (opl *OperationLog) getAppLogFile(appDB string) *lumberjack.Logger {
	return &lumberjack.Logger{
		Filename:   opl.FileOptions.Filename + appDB + ".log",
		MaxSize:    opl.FileOptions.MaxSize, // megabytes
		MaxBackups: opl.FileOptions.MaxBackups,
		MaxAge:     opl.FileOptions.MaxAge,   //days
		Compress:   opl.FileOptions.Compress, // disabled by default
		LocalTime:  opl.FileOptions.LocalTime,
	}
}

func (opl *OperationLog) WriteLog(item *OplogItem) {
	appLog, exist := opl.AppLogs[item.AppDB]
	if !exist {
		appLog = opl.AddAppLogFile(item.AppDB)
	}

	if appLog != nil {
		itemStr, _ := (json.Marshal(item))
		appLog.Write(itemStr)
		appLog.Write([]byte(gLineSpliter))
	}
}
