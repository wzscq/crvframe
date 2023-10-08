package log

import (
	"fmt"
	"gopkg.in/natefinch/lumberjack.v2"
	"crv/frame/common"
)

type CRVLogWriter struct {
	WriteFile bool
	FileOptions common.FileOptionConf
	FileLogger *lumberjack.Logger
}

func (w *CRVLogWriter)Write(p []byte) (n int, err error){
	fmt.Println(string(p))

	if w.WriteFile== true {
		w.WriteLogToFile(p)
	}

	return len(p),nil
}

func (w *CRVLogWriter)WriteLogToFile(p []byte){
	if w.FileLogger==nil {
		w.FileLogger=&lumberjack.Logger{
			Filename:   w.FileOptions.Filename,
			MaxSize:    w.FileOptions.MaxSize, // megabytes
			MaxBackups: w.FileOptions.MaxBackups,
			MaxAge:     w.FileOptions.MaxAge, //days
			Compress:   w.FileOptions.Compress, // disabled by default
			LocalTime:  w.FileOptions.LocalTime,
		}
	}
	w.FileLogger.Write(p)
}