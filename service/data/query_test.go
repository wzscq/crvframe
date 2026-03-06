package data

import (
	"testing"
	"fmt"
	"crv/frame/common"
	crvlog "crv/frame/log"
	"log"
	"encoding/json"
)

func TestQueryTreeparent(t *testing.T){
	conf:=common.InitConfig("../conf/conf_hewei.json")
	if conf==nil {
		t.Errorf("InitConfig failed")
	}

	crvlog.InitCRVLog(&conf.Log)
	//设置log打印文件名和行号
	log.SetFlags(log.Lshortfile | log.LstdFlags)

	dataRepo := &DefatultDataRepository{}
	dataRepo.Connect(
		conf.Mysql.Server,
		conf.Mysql.User,
		conf.Mysql.Password,
		conf.Mysql.DBName,
		conf.Mysql.ConnMaxLifetime,
		conf.Mysql.MaxOpenConns,
		conf.Mysql.MaxIdleConns,
		conf.Mysql.TLS)

	fieldType:="treeparent"
	relatedField:="parent_department_id"
	modelID:="department"
	fields:=[]Field{
		Field{
			Field:"id",
		},
		Field{
			Field:"name",
		},
		Field{
			Field:"parent_department_id",
		},
		Field{
			Field:"subs",
			FieldType:&fieldType,
			RelatedField:&relatedField,
		},
	}
	
	filter:=&map[string]interface{}{
		"id":map[string]interface{}{
			"Op.eq":"001",
		},
	}

	appDB:="amis"

	query := &Query{
		ModelID:    modelID,
		Filter:     filter,
		Fields:     &fields,
		AppDB:      appDB,
		UserRoles:  "*",
		UserID:     "admin",
	}
	
	result, errorCode := query.Execute(dataRepo, true)
	fmt.Println(errorCode)
	fmt.Println(result)
	dataStr, _ := json.Marshal(result)
	fmt.Println(string(dataStr))

}