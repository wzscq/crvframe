package common

import (
	"log/slog"
	"os"
	"encoding/json"
)

type redisConf struct {
	Server string `json:"server"`
	TokenExpired string `json:"tokenExpired"`
	TokenDB int `json:"tokenDB"`
	OauthTokenExpired string `json:"oauthTokenExpired"`
	OauthTokenDB int `json:"oauthTokenDB"`
	FlowInstanceDB int `json:"flowInstanceDB"`
	FlowInstanceExpired string `json:"flowInstanceExpired"`
	AppCacheDB int `json:"appCacheDB"`
	UploadCacheDB int `json:"uploadCacheDB"`
	UploadCacheExpired string `json:"uploadCacheExpired"`
	Password string `json:"password"`
	DownloadCacheDB int `json:"downloadCacheDB"`
	DownloadCacheExpired string `json:"downloadCacheExpired"`
}

type mysqlConf struct {
	Server string `json:"server"`
	Password string `json:"password"`
	User string `json:"user"`
	DBName string `json:"dbName"`
	ConnMaxLifetime int `json:"connMaxLifetime"` 
  MaxOpenConns int `json:"maxOpenConns"`
  MaxIdleConns int `json:"maxIdleConns"`
}

type serviceConf struct {
	Port string `json:"port"`
}

type fileConf struct {
	Root string `json:"root"`
}

type casConf struct {
	Url string  `json:"url"`
}

type LoginLog struct {
	Apps map[string]bool `json:"apps"`
}

type OperationLogConf struct {
	Apps map[string]bool `json:"apps"`
	FileOptions FileOptionConf `json:"fileOptions"`
}

type FileOptionConf struct {
	MaxSize int `json:"maxSize"`
	MaxBackups int `json:"maxBackups"`
	MaxAge int `json:"maxAge"`
	Compress bool `json:"compress"`
	LocalTime bool `json:"localTime"`
	Filename string `json:"filename"`
}

type LogConf struct {
	Level string `json:"level"`
	WriteFile bool `json:"writeFile"`
	FileOptions FileOptionConf `json:"fileOptions"`
}

type Config struct {
	Redis  redisConf  `json:"redis"`
	Mysql  mysqlConf  `json:"mysql"`
	Service serviceConf `json:"service"`
	File fileConf `json:"file"`
	Cas casConf `json:"cas"`
	OperationLog OperationLogConf `json:"operationLog"`
	Log LogConf `json:"log"`
	LoginLog LoginLog `json:"loginLog"`
}

var gConfig Config

func InitConfig(confFile string)(*Config){
	slog.Debug("init configuation start ...")
	//获取用户账号
	//获取用户角色信息
	//根据角色过滤出功能列表
	fileName := confFile
	filePtr, err := os.Open(fileName)
	if err != nil {
		slog.Error("Open file failed [Err:"+err.Error()+"]")
  }
  defer filePtr.Close()

	//创建json解码器
  decoder := json.NewDecoder(filePtr)
  err = decoder.Decode(&gConfig)
	if err != nil {
		slog.Error("json file decode failed [Err:"+err.Error()+"]", )
	}

	err=os.MkdirAll(gConfig.File.Root, 0755)
	if err != nil {
		// 打印错误和更多的调试信息
		slog.Error("create file root failed [Err:"+err.Error()+"]", )
 	}

	slog.Debug("init configuation end")

	

	return &gConfig
}

func GetConfig()(*Config){
	return &gConfig
}