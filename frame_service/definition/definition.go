package definition

import (
	"log"
	"encoding/json"
	"os"
	"crv/frame/common"
	"strings"
)

type ModelConf struct {
	ModelID string `json:"modelID"`
	Fields []fieldConf `json:"fields"`
}

type Dataset struct {
	ID string `json:"id"`
	Filter *map[string]interface{} `json:"filter"`
	Fields string `json:"fields"`
	QueryRoles *interface{} `json:"queryRoles"`
	MutationRoles *interface{} `json:"mutationRoles"`
}

type ModelDataSet struct {
	ModelID string `json:"modelID"`
	Datasets []Dataset `json:"datasets"`
}

const (
	DATA_OP_TYPE_QUERY = "query"
	DATA_OP_TYPE_MUTATION = "mutation"
)

const (
	Op_or = "Op.or"
)

func MergeDatasets(datasets []Dataset)(*Dataset){
	//一组dataset中的字段和过滤条件合并到一个dataset中
	filter:=&[]interface{}{}
	fields:=""
	for dsIndex:=range datasets {
		dataset:=datasets[dsIndex]
		//所有数据集中如果存在不附带查询条件的，则其他数据集携带的条件可以忽略
		if filter!=nil {
			if dataset.Filter != nil && len(*(dataset.Filter))>0 {
				(*filter)=append((*filter),*(dataset.Filter))
			} else {
				filter=nil
			}
		}

		//所有数据集中如果存在不规定查询字段的，则其他数据集的查询字段限制可以忽略
		if fields != "*" && len(dataset.Fields)>0 {
			if dataset.Fields == "*" {
				fields = "*"
			} else {
				fields = fields +","+dataset.Fields
			}
		}
	}

	dataset:=Dataset{
		Filter:nil,
		Fields:fields,
	}

	if filter != nil {
		dataset.Filter=&map[string]interface{}{
			Op_or:*filter,
		}
	}

	return &dataset
}

func GetUserDataset(appDB string,modelID string,userRoles string,opType string)(*Dataset,int){
	log.Println("start GetUserDataset with parameters:",appDB,modelID,userRoles,opType)

	modelFile := "apps/"+appDB+"/models/"+modelID+".json"
	filePtr, err := os.Open(modelFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return nil,common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	modelDataset:=ModelDataSet{}
	err = decoder.Decode(&modelDataset)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return nil,common.ResultJsonDecodeError
	}

	// 获取有权限的数据集
	dsCount:=0
	for dsIndex:=range modelDataset.Datasets {
		log.Println(modelDataset.Datasets[dsIndex])
		if HasRight(modelDataset.Datasets[dsIndex].MutationRoles,userRoles) || 
		   (opType == DATA_OP_TYPE_QUERY && 
		   HasRight(modelDataset.Datasets[dsIndex].QueryRoles,userRoles)) {
			modelDataset.Datasets[dsCount]=modelDataset.Datasets[dsIndex]
			dsCount++
		}
	}

	if dsCount == 0 {
		log.Println("end GetUserDataset no permission with parameters:",appDB,modelID,userRoles,opType)
		return nil,common.ResultNoPermission
	}

	modelDataset.Datasets=modelDataset.Datasets[:dsCount]

	//合并为一个数据集对象
	dataset:=MergeDatasets(modelDataset.Datasets)

	if dataset.Filter != nil {
		log.Println("filter:", *dataset.Filter)	
	}
	log.Println("end GetUserDataset with result:", dataset)

	return dataset,common.ResultSuccess 
}

func GetModelConf(appDB string,modelID string)(*ModelConf,int){
	modelFile := "apps/"+appDB+"/models/"+modelID+".json"
	filePtr, err := os.Open(modelFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return nil,common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	modelConf:=&ModelConf{}
	err = decoder.Decode(modelConf)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return nil,common.ResultJsonDecodeError
	}
	
	return modelConf,common.ResultSuccess
}

func HasRight(roles *interface{},userRoles string)(bool){
	log.Println("start HasRight with parameters:",roles,userRoles)
	
	if roles == nil {
		log.Println("end HasRight with nil roles")
		return false
	}

	log.Println("roels :",*roles)

	userRoles=","+userRoles+","
	rolesStr,ok:=(*roles).(string)
	if ok {
		if rolesStr == "*" {
			log.Println("end HasRight with roles of *")
			return true
		}

		if strings.Contains(userRoles,","+rolesStr+",") {
			return true
		}
		log.Println("end HasRight with false")
		return false
	}

	rolesArr,ok:=(*roles).([]interface{})
	if ok {
		for idx:=range rolesArr {
			rolesStr,ok:=(rolesArr[idx]).(string)
			if ok {
				if strings.Contains(userRoles,","+rolesStr+",") {
					return true
				}
			}
		}
	}

	log.Println("end HasRight with false")
	return false
}