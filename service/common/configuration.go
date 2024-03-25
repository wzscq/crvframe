package common

import (
	"log/slog"
	//"os"
	//"encoding/json"
	"github.com/spf13/viper"
)

type runtimeConf struct {
	GoMaxProcs int `json:"goMaxProcs" mapstructure:"goMaxProcs"`
}

type redisConf struct {
	Server               string `json:"server" mapstructure:"server"`
	TokenExpired         string `json:"tokenExpired" mapstructure:"tokenExpired"`
	TokenDB              int    `json:"tokenDB" mapstructure:"tokenDB"`
	OauthTokenExpired    string `json:"oauthTokenExpired" mapstructure:"oauthTokenExpired"`
	OauthTokenDB         int    `json:"oauthTokenDB" mapstructure:"oauthTokenDB"`
	FlowInstanceDB       int    `json:"flowInstanceDB" mapstructure:"flowInstanceDB"`
	FlowInstanceExpired  string `json:"flowInstanceExpired" mapstructure:"flowInstanceExpired"`
	AppCacheDB           int    `json:"appCacheDB" mapstructure:"appCacheDB"`
	UploadCacheDB        int    `json:"uploadCacheDB" mapstructure:"uploadCacheDB"`
	UploadCacheExpired   string `json:"uploadCacheExpired" mapstructure:"uploadCacheExpired"`
	Password             string `json:"password" mapstructure:"password"`
	DownloadCacheDB      int    `json:"downloadCacheDB" mapstructure:"downloadCacheDB"`
	DownloadCacheExpired string `json:"downloadCacheExpired" mapstructure:"downloadCacheExpired"`
	TLS			         string   `json:"tls" mapstructure:"tls"`
}

type mysqlConf struct {
	Server          string `json:"server" mapstructure:"server"`
	Password        string `json:"password" mapstructure:"password"`
	User            string `json:"user" mapstructure:"user"`
	DBName          string `json:"dbName" mapstructure:"dbName"`
	ConnMaxLifetime int    `json:"connMaxLifetime" mapstructure:"connMaxLifetime"`
	MaxOpenConns    int    `json:"maxOpenConns" mapstructure:"maxOpenConns"`
	MaxIdleConns    int    `json:"maxIdleConns" mapstructure:"maxIdleConns"`
	TLS			    string   `json:"tls" mapstructure:"tls"` //skip-verify
}

type serviceConf struct {
	Port string `json:"port" mapstructure:"port"`
}

type fileConf struct {
	Root string `json:"root" mapstructure:"root"`
}

type casConf struct {
	Url string `json:"url" mapstructure:"url"`
}

type LoginLog struct {
	Apps map[string]bool `json:"apps" mapstructure:"apps"`
}

type OperationLogConf struct {
	Apps        map[string]bool `json:"apps" mapstructure:"apps"`
	FileOptions FileOptionConf  `json:"fileOptions" mapstructure:"fileOptions"`
}

type FileOptionConf struct {
	MaxSize    int    `json:"maxSize" mapstructure:"maxSize"`
	MaxBackups int    `json:"maxBackups" mapstructure:"maxBackups"`
	MaxAge     int    `json:"maxAge" mapstructure:"maxAge"`
	Compress   bool   `json:"compress" mapstructure:"compress"`
	LocalTime  bool   `json:"localTime" mapstructure:"localTime"`
	Filename   string `json:"filename" mapstructure:"filename"`
}

type LogConf struct {
	Level       string         `json:"level" mapstructure:"level"`
	WriteFile   bool           `json:"writeFile" mapstructure:"writeFile"`
	FileOptions FileOptionConf `json:"fileOptions"  mapstructure:"fileOptions"`
}

type Config struct {
	Redis        redisConf        `json:"redis" mapstructure:"redis"`
	Mysql        mysqlConf        `json:"mysql" mapstructure:"mysql"`
	Service      serviceConf      `json:"service" mapstructure:"service"`
	File         fileConf         `json:"file" mapstructure:"file"`
	Cas          casConf          `json:"cas" mapstructure:"cas"`
	OperationLog OperationLogConf `json:"operationLog" mapstructure:"operationLog"`
	Log          LogConf          `json:"log" mapstructure:"log"`
	LoginLog     LoginLog         `json:"loginLog" mapstructure:"loginLog"`
	Runtime      runtimeConf      `json:"runtime" mapstructure:"runtime"`
}

var gConfig Config

func InitConfig(confFile string) *Config {
	slog.Debug("init configuation start ...")

	viper.SetDefault("mysql.tls", "false")
	viper.SetDefault("redis.tls", "false")

	viper.BindEnv("redis.server", "CRV_REDIS_SERVER")
	viper.BindEnv("redis.password", "CRV_REDIS_PASSWORD")
	viper.BindEnv("redis.tls", "CRV_REDIS_TLS")
	viper.BindEnv("mysql.server", "CRV_MYSQL_SERVER")
	viper.BindEnv("mysql.password", "CRV_MYSQL_PASSWORD")
	viper.BindEnv("mysql.user", "CRV_MYSQL_USER")
	viper.BindEnv("mysql.tls", "CRV_MYSQL_TLS")
	viper.SetConfigFile(confFile)

	err := viper.ReadInConfig()
	if err != nil {
		slog.Error("ReadInConfig failed [Err:" + err.Error() + "]")
		return nil
	}

	err = viper.Unmarshal(&gConfig)
	if err != nil {
		slog.Error("Unmarshal failed [Err:" + err.Error() + "]")
		return nil
	}
	slog.Debug("init configuation end")
	return &gConfig
}

/*func InitConfig(confFile string)(*Config){
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
}*/

func GetConfig() *Config {
	return &gConfig
}
