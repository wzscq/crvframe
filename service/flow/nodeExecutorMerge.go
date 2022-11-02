package flow

import (
    "time"
	"crv/frame/common"
	"crv/frame/data"
	"log"
	"encoding/json"
)

const (
	VALUE_TYPE_SR = "selectedRowKey"
	VALUE_TYPE_SAVE = "saveValue"
)

type mergeField struct {
	FieldSource string `json:"fieldSource,omitempty"`
	FieldName string  `json:"fieldName,omitempty"`
	ValueType string `json:"valueType,omitempty"`
}

type mergeConf struct {
	MainSource string `json:"mainSource,omitempty"`
	MergeFields []mergeField `json:"mergeFields,omitempty"`
}

type nodeExecutorMerge struct {
	NodeConf *node
}

func (nodeExecutor *nodeExecutorMerge)getNodeConf()(*mergeConf){
	mapData,_:=nodeExecutor.NodeConf.Data.(map[string]interface{})
	jsonStr, err := json.Marshal(mapData)
    if err != nil {
        log.Println(err)
		return nil
    }
	log.Println(string(jsonStr))
	conf:=&mergeConf{}
    if err := json.Unmarshal(jsonStr, conf); err != nil {
        log.Println(err)
		return nil
    }

	return conf
}

func (nodeExecutor *nodeExecutorMerge)getValueOfSelectedRowKeys(nodeData *flowReqRsp)(*flowReqRsp){
	if nodeData.SelectedRowKeys == nil || len(*nodeData.SelectedRowKeys)==0 {
		log.Println("nodeExecutorMerge getValueOfSelectedRowKeys SelectedRowKeys is empty.")
		return nil
	}

	modelID:=*nodeData.ModelID
	list:=[]map[string]interface{}{}
	for _,strID:=range(*nodeData.SelectedRowKeys){
		list=append(
			list,
			map[string]interface{}{
				data.CC_ID:strID,
				data.SAVE_TYPE_COLUMN:data.SAVE_CREATE,
			})
	}

	value:=flowReqRsp{
		ModelID:&modelID,
		List:&list,
	}

	return &value
}

func (nodeExecutor *nodeExecutorMerge)getValueOfSave(data *flowReqRsp)(*flowReqRsp){
	return data
}

func (nodeExecutor *nodeExecutorMerge)getFieldValue(
	fieldConf *mergeField,
	instance *flowInstance)(interface{}){
	fieldSource:=nodeExecutor.getFlowData(fieldConf.FieldSource,instance)
	if fieldSource==nil {
		log.Println("nodeExecutorMerge getFieldValue nil :"+fieldConf.FieldSource)
		return nil
	}

	if fieldConf.ValueType == VALUE_TYPE_SR {
		return nodeExecutor.getValueOfSelectedRowKeys(fieldSource)
	}

	if fieldConf.ValueType == VALUE_TYPE_SAVE {
		return nodeExecutor.getValueOfSave(fieldSource)
	}

	log.Println("nodeExecutorMerge getFieldValue not supported ValueType:"+fieldConf.ValueType)
	return nil
}

func (nodeExecutor *nodeExecutorMerge)getFlowDataFromMap(mapData map[string]interface{})(*flowReqRsp){
	modelID,ok:=mapData["modelID"]
	if !ok {
		return nil
	}
	modelIDStr,ok:=modelID.(string)
	if !ok {
		return nil
	}

	flowData:=flowReqRsp{
		ModelID:&modelIDStr,
	}

	list,_:=mapData["list"]
	if list!=nil {
		listMap,_:=list.([]map[string]interface{})
		flowData.List=&listMap
	}
	selectedRowKeysInterface,_:=mapData["selectedRowKeys"]
	if selectedRowKeysInterface!=nil {
		selectedRowKeysArray,_:=selectedRowKeysInterface.([]interface{})
		stringArray:=[]string{}
		for _,id:=range(selectedRowKeysArray){
			strID,_:=id.(string)
			stringArray=append(stringArray,strID)
		}
		flowData.SelectedRowKeys=&stringArray
	}

	return &flowData
}

func (nodeExecutor *nodeExecutorMerge)getFlowData(
	source string,instance *flowInstance)(*flowReqRsp){
	for _,instanceNode:=range(instance.Nodes) {
		if instanceNode.ID == source {
			outData,ok:=instanceNode.Data["output"]
			if !ok {
				return nil
			}

			pflowData,ok:=outData.(*flowReqRsp)
			if ok {
				return pflowData
			}
			
			flowData,ok:=outData.(map[string]interface{})
			if ok {
				return nodeExecutor.getFlowDataFromMap(flowData)
			}
			log.Println("nodeExecutorMerge getFlowData cannot convert outdata to flowReqRsp source is "+source)
			return nil
		}
	}
	return nil
}

func (nodeExecutor *nodeExecutorMerge)mergedData(
	nodeConf *mergeConf,
	instance *flowInstance)(*flowReqRsp){
	mainSource:=nodeExecutor.getFlowData(nodeConf.MainSource,instance)
	if mainSource!=nil && mainSource.List!=nil && len(*mainSource.List)>0 {
		for _,field:=range(nodeConf.MergeFields){
			(*mainSource.List)[0][field.FieldName]=nodeExecutor.getFieldValue(&field,instance)
		}
	}
	return mainSource
}

func (nodeExecutor *nodeExecutorMerge)run(
	instance *flowInstance,
	node *instanceNode,
	req *flowReqRsp,
	userID,userRoles,userToken string)(*flowReqRsp,*common.CommonError){
	
	nodeConf:=nodeExecutor.getNodeConf()
	if nodeConf==nil {
		return nil,common.CreateError(common.ResultLoadNodeConfError,nil)
	}

	result:=nodeExecutor.mergedData(nodeConf,instance)
	
	endTime:=time.Now().Format("2006-01-02 15:04:05")
	node.Completed=true
	node.EndTime=&endTime
	node.Data=map[string]interface{}{
			"output":result,
		}
	node.UserID=userID
	return result,nil
}