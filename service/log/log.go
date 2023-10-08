package log

import (
	"log/slog"
	"crv/frame/common"
)

func InitCRVLog(conf *common.LogConf){
	logWriter:=&CRVLogWriter{WriteFile:conf.WriteFile,FileOptions:conf.FileOptions}
	logger := slog.New(slog.NewJSONHandler(logWriter, &slog.HandlerOptions{Level:getLevel(conf.Level),AddSource:true}))
  slog.SetDefault(logger)
}

func getLevel(level string) slog.Level{
	switch level {
	case "debug":
		return slog.LevelDebug
	case "info":
		return slog.LevelInfo
	case "warn":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}



