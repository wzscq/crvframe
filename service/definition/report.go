package definition

import (
	"log"
	"encoding/json"
	"os"
	"crv/frame/common"
)

type ReportConf struct {
	ReportID string `json:"reportID"`

}

func getReportConf(appDB,reportID string)(*ReportConf,int){
	var reportConf ReportConf
	confFile := "apps/"+appDB+"/reports/"+reportID+".json"
	filePtr, err := os.Open(confFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return nil,common.ResultOpenFileError
	}
	defer filePtr.Close()
	//创建json解码器
	decoder := json.NewDecoder(filePtr)
	err = decoder.Decode(&reportConf)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return nil,common.ResultJsonDecodeError
	}
	
	return &reportConf,common.ResultSuccess
}