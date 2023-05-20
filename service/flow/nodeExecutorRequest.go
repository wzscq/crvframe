package flow

import (
    "time"
	"crv/frame/common"
	"log"
	"encoding/json"
	"net/http"
	"bytes"
	"io/ioutil"
)

type request struct {
	ModelID string `json:"modelID"`
	ViewID *string `json:"viewID"`
	Filter *map[string]interface{} `json:"filter"`
	List *[]map[string]interface{} `json:"list"`
	UserID string `json:"userID"`
	AppDB string `json:"appDB"`
	UserRoles string `json:"userRoles"`
	FlowID string `json:"flowID"`
	//Fields *[]field `json:"fields"`
	//Sorter *[]sorter `json:"sorter"`
	SelectedRowKeys *[]string `json:"selectedRowKeys"`
	//Pagination *pagination `json:"pagination"`
}

type response struct {
	ErrorCode int `json:"errorCode"`
	Message string `json:"message"`
	Error bool `json:"error"`
	Result *flowReqRsp `json:"result"`
	Params map[string]interface{} `json:"params"`
}

type requestConf struct {
	Url string `json:"url,omitempty"`
}

type nodeExecutorRequest struct {
	NodeConf *node
}

func (nodeExecutor *nodeExecutorRequest)getNodeConf()(*requestConf){
	mapData,_:=nodeExecutor.NodeConf.Data.(map[string]interface{})
	jsonStr, err := json.Marshal(mapData)
    if err != nil {
        log.Println(err)
		return nil
    }
	log.Println(string(jsonStr))
	conf:=&requestConf{}
    if err := json.Unmarshal(jsonStr, conf); err != nil {
        log.Println(err)
		return nil
    }

	return conf
}

func (nodeExecutor *nodeExecutorRequest)sendRequest(
	nodeConf *requestConf,
	req *flowReqRsp,
	appDB,userID,userRoles,userToken string)(*response,int){
	
	reqBody:=request{
		ModelID:*req.ModelID,
		Filter:req.Filter,
		List:req.List,
		UserID:userID,
		AppDB:appDB,
		UserRoles:userRoles,
	}
	
	postJson,_:=json.Marshal(reqBody)
	postBody:=bytes.NewBuffer(postJson)
	log.Println("http.Post ",nodeConf.Url,string(postJson))
	postReq,err:=http.NewRequest("POST",nodeConf.Url,postBody)
	if err != nil { 
		log.Println(err)
		return nil,common.ResultPostExternalApiError
	}
	log.Println("userToken:",userToken)
	postReq.Header.Set("token", userToken)
	postReq.Header.Set("userID", userID)
	postReq.Header.Set("appDB", appDB)
	postReq.Header.Set("userRoles", userRoles)
	postReq.Header.Set("Content-Type","application/json")

	resp, err := (&http.Client{}).Do(postReq)
	if err != nil || resp==nil || resp.StatusCode != 200 { 
		log.Println(resp)
		return nil,common.ResultPostExternalApiError
	}

	defer resp.Body.Close()
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        log.Println(err)
    }
    log.Println(string(body))
	rsp:=&response{}
    if err := json.Unmarshal(body, rsp); err != nil {
        log.Println(err)
		return nil,common.ResultPostExternalApiError
    }

	return rsp,common.ResultSuccess
}

func (nodeExecutor *nodeExecutorRequest)run(
	instance *flowInstance,
	node *instanceNode,
	req *flowReqRsp,
	userID,userRoles,userToken string)(*flowReqRsp,*common.CommonError){
	
	nodeConf:=nodeExecutor.getNodeConf()
	if nodeConf==nil {
		return nil,common.CreateError(common.ResultLoadNodeConfError,nil)
	}

	rsp,errorCode:=nodeExecutor.sendRequest(nodeConf,req,instance.AppDB,userID,userRoles,userToken)
	if errorCode!=common.ResultSuccess {
		return nil,common.CreateError(errorCode,nil)
	}

	if rsp.Error == true {
		return nil,&common.CommonError{
			ErrorCode:rsp.ErrorCode,
			Message:rsp.Message,
		}
	}
	
	endTime:=time.Now().Format("2006-01-02 15:04:05")
	node.Completed=true
	node.EndTime=&endTime
	node.Data=map[string]interface{}{
			"output":rsp.Result,
		}
	node.UserID=userID
	return rsp.Result,nil
}