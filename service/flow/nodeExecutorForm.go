package flow

import (
    "time"
	"crv/frame/common"
	"log"
	"encoding/json"
)

type formParams struct {
	Url string `json:"url,omitempty"` 
	Location string `json:"location,omitempty"`
	Title string  `json:"title,omitempty"`
	Key string  `json:"key,omitempty"`
	Width int `json:"width,omitempty"`
	Height int  `json:"height,omitempty"`
}

type nodeExecutorForm struct {
	NodeConf *node
}

func (nodeExecutor *nodeExecutorForm)getNodeConf()(*formParams){
	mapData,_:=nodeExecutor.NodeConf.Data.(map[string]interface{})
	jsonStr, err := json.Marshal(mapData)
    if err != nil {
        log.Println(err)
		return nil
    }
	log.Println(string(jsonStr))
	conf:=&formParams{}
    if err := json.Unmarshal(jsonStr, conf); err != nil {
        log.Println(err)
		return nil
    }

	return conf
}

func (nodeExecutor *nodeExecutorForm)runStage0(
	instance *flowInstance,
	node *instanceNode,
	req *flowReqRsp,
	userID string)(*flowReqRsp,*common.CommonError){
	
	formParams:=nodeExecutor.getNodeConf()
	if formParams==nil {
		return nil,common.CreateError(common.ResultLoadNodeConfError,nil)
	}
	stage:=1
	operation:=map[string]interface{}{
		"id":"", 
        "type":"open",
        "params":map[string]interface{}{
                    "url":formParams.Url,
                    "location":formParams.Location,
                    "title":formParams.Title,
                    "key":formParams.Key,
                    "width":formParams.Width,
                    "height":formParams.Height,
        },
        "input":map[string]interface{}{
			"flowInstanceID":&(instance.InstanceID),
			"stage":&stage,
		},
        "description":"",
	}
	
	result:=&flowReqRsp{
		Operation:&operation,
	}

	node.Data=map[string]interface{}{
			"stage0":map[string]interface{}{
				"output":result,
				"userID":userID,
			},
		}
	node.UserID=userID
	return result,nil
}

func (nodeExecutor *nodeExecutorForm)runStage1(
	instance *flowInstance,
	node *instanceNode,
	req *flowReqRsp,
	userID string)(*flowReqRsp,*common.CommonError){
	
	endTime:=time.Now().Format("2006-01-02 15:04:05")
	node.Completed=true
	node.EndTime=&endTime
	node.UserID=userID	
	node.Data["output"]=req
	return req,nil
}

func (nodeExecutor *nodeExecutorForm)run(
	instance *flowInstance,
	node *instanceNode,
	req *flowReqRsp,
	userID,userRoles,userToken string)(*flowReqRsp,*common.CommonError){

	if req.Stage==nil || *(req.Stage) == 0 {
		return nodeExecutor.runStage0(instance,node,req,userID)
	}

	return nodeExecutor.runStage1(instance,node,req,userID)
}