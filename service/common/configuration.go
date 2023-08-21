package common

import (
	"log"
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
	Password string `json:"password"`
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

type Config struct {
	Redis  redisConf  `json:"redis"`
	Mysql  mysqlConf  `json:"mysql"`
	Service serviceConf `json:"service"`
	File fileConf `json:"file"`
	Cas casConf `json:"cas"`
}

var gConfig Config

func InitConfig(confFile string)(*Config){
	log.Println("init configuation start ...")
	//获取用户账号
	//获取用户角色信息
	//根据角色过滤出功能列表
	fileName := confFile
	filePtr, err := os.Open(fileName)
	if err != nil {
        log.Fatal("Open file failed [Err:%s]", err.Error())
    }
    defer filePtr.Close()

	// 创建json解码器
    decoder := json.NewDecoder(filePtr)
    err = decoder.Decode(&gConfig)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
	}
	log.Println("init configuation end")
	return &gConfig
}

func GetConfig()(*Config){
	return &gConfig
}