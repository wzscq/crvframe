package common

import (
	"log"
	"os"
	"encoding/json"
)

type redisConf struct {
	Server string `json:"server"`
	TokenExpired string `json:"tokenExpired"`
}

type mysqlConf struct {
	Server string `json:"server"`
	Password string `json:"password"`
	User string `json:"user"`
	DBName string `json:"dbName"`
}

type serviceConf struct {
	Port string `json:"port"`
}

type fileConf struct {
	Root string `json:"root"`
}

type Config struct {
	Redis  redisConf  `json:"redis"`
	Mysql  mysqlConf  `json:"mysql"`
	Service serviceConf `json:"service"`
	File fileConf `json:"file"`
}

var gConfig Config

func InitConfig()(*Config){
	log.Println("init configuation start ...")
	//获取用户账号
	//获取用户角色信息
	//根据角色过滤出功能列表
	fileName := "conf/conf.json"
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