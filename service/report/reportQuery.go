package report

import (
	"crv/frame/data"
	"crv/frame/common"
	"io/ioutil"
	"encoding/json"
	"bytes"
	"log"
	"net/http"
	"time"
)

func QueryBySql(sql string,dataRepository data.DataRepository)(interface{},*common.CommonError){
	//执行查询获取数据
	res,sqlErr:=dataRepository.Query(sql)
	if sqlErr!=nil {
		params:=map[string]interface{}{
			"sqlErr":sqlErr.Error(),
		}
		return nil,common.CreateError(common.ResultSQLError,params)
	}

	return res,nil
}

func QueryByRequest(
	appDB,userID,userRoles,userToken string,
	requestOption map[string]interface{})(interface{},*common.CommonError){
	
	req:=map[string]interface{}{
		"userID":userID,
		"userRoles":userRoles,
		"userToken":userToken,
		"appDB":appDB,
	}

	url,ok:=requestOption["url"]
	if !ok {
		return nil,common.CreateError(common.ResultNotSupportedReportQuery,nil)
	}
	postUrl,ok:=url.(string)
	if !ok {
		return nil,common.CreateError(common.ResultNotSupportedReportQuery,nil)
	}

	params,ok:=requestOption["params"]
	if ok {
		paramsMap,ok:=params.(map[string]interface{})
		if !ok {
			return nil,common.CreateError(common.ResultNotSupportedReportQuery,nil)
		}

		if len(paramsMap)>0 {
			for key,value:=range paramsMap {
				req[key]=value
			}
		}
	}

	postJson,_:=json.Marshal(req)
	postBody:=bytes.NewBuffer(postJson)
	log.Println("http.Post ",postUrl,string(postJson))

	httpRequest, err := http.NewRequest("POST",postUrl,postBody)
	if err != nil {
		log.Fatal("Error reading request. ", err)
		return nil,common.CreateError(common.ResultPostExternalApiError,nil)
	}

	// Set headers
	httpRequest.Header.Set("Content-Type", "application/json")
	httpRequest.Header.Set("userID", userID)
	httpRequest.Header.Set("userRoles", userRoles)
	httpRequest.Header.Set("userToken", userToken)
	httpRequest.Header.Set("appDB", appDB)

	client := &http.Client{Timeout: time.Second * 10}
	resp, err := client.Do(httpRequest)

	if err != nil || resp==nil || resp.StatusCode != 200 { 
		log.Println(resp)
		return nil,common.CreateError(common.ResultPostExternalApiError,nil)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	log.Println("resp",string(body))
	
	rsp:=&common.CommonRsp{}
	if err := json.Unmarshal(body, rsp); err != nil {
		log.Println(err)
		return nil,common.CreateError(common.ResultReadExternalApiResultError,nil)
	}

	if rsp.Error==true {
		commonError:=&common.CommonError{
			ErrorCode:rsp.ErrorCode,
			Message:rsp.Message,
			Params:rsp.Params,
		}
		return nil,commonError
	}

	if rsp.Result!=nil {
		resultMap,ok:=rsp.Result.(map[string]interface{})
		if ok {
			resultList,ok:=resultMap["list"]
			if ok && resultList!=nil {
				return resultList,nil
			}
		}
	}

	return nil,nil
}

func QueryData(
	appDB,userID,userRoles,userToken string,
	query interface{},dataRepository data.DataRepository)(interface{},*common.CommonError){
	switch query.(type) {
	case string:
		return QueryBySql(query.(string),dataRepository)
	case map[string]interface{}: 
		return QueryByRequest(appDB,userID,userRoles,userToken,query.(map[string]interface{}))
	}
	return nil,common.CreateError(common.ResultNotSupportedReportQuery,nil)
}