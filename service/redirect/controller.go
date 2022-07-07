package redirect

import (
	"os"
	"log"
	"github.com/gin-gonic/gin"
	"crv/frame/common"
	"net/http"
	"encoding/json"
	"bytes"
	//"io/ioutil"
)

type commonRep struct {
	ModelID string `json:"modelID"`
	ViewID *string `json:"viewID"`
	To *string `json:"to"`
	Filter *map[string]interface{} `json:"filter"`
	List *[]map[string]interface{} `json:"list"`
	//Fields *[]field `json:"fields"`
	//Sorter *[]sorter `json:"sorter"`
	SelectedRowKeys *[]string `json:"selectedRowKeys"`
	//Pagination *pagination `json:"pagination"`
}

type apiItem struct {
	Url string `json:"url"`
}

type RedirectController struct {
	 
}

func (controller *RedirectController)getApiUrl(appDB,apiId string)(string,int){
	log.Println("start getApiUrl ")
	apiConfigFile := "apps/"+appDB+"/external_api.json"
	filePtr, err := os.Open(apiConfigFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return "",common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	apiConf:=map[string]apiItem{}
	err = decoder.Decode(&apiConf)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return "",common.ResultJsonDecodeError
	}

	api,ok:=apiConf[apiId]
	if !ok {
		return "",common.ResultNoExternalApiUrl
	}
	log.Println("end getApiUrl ",api.Url)
	return api.Url,common.ResultSuccess
}

func (controller *RedirectController)redirect(c *gin.Context){
	log.Println("start redirect ")
			
	var rep commonRep
	if err := c.BindJSON(&rep); err != nil {
		log.Println(err)
		rsp:=common.CreateResponse(common.ResultWrongRequest,nil)
		c.IndentedJSON(http.StatusOK, rsp.Rsp)
		log.Println("end redirect with error")
		return
    }
		
	if rep.To==nil{
		rsp:=common.CreateResponse(common.ResultNoExternalApiId,nil)
		c.IndentedJSON(http.StatusOK, rsp.Rsp)
		log.Println("end redirect with error")
		return
	}

	appDB:= c.MustGet("appDB").(string)
	//get url
	postUrl,errorCode:=controller.getApiUrl(appDB,*rep.To)
	if errorCode != common.ResultSuccess {
		rsp:=common.CreateResponse(errorCode,nil)
		c.IndentedJSON(http.StatusOK, rsp.Rsp)
		return 
	}

	rep.To=nil
	postJson,_:=json.Marshal(rep)
	postBody:=bytes.NewBuffer(postJson)
	log.Println("http.Post ",postUrl,postJson)
	resp,err:=http.Post(postUrl,"application/json",postBody)

	if err != nil || resp==nil || resp.StatusCode != 200 { 
		log.Println(resp)
		rsp:=common.CreateResponse(common.ResultPostExternalApiError,nil)
		c.IndentedJSON(http.StatusOK, rsp.Rsp)
		return 
	}

	log.Println("resp",resp)
	defer resp.Body.Close()
	rsp:=common.CreateResponse(common.ResultSuccess,nil)
	c.IndentedJSON(http.StatusOK, rsp.Rsp)
	log.Println("end redirect success")
}

func (controller *RedirectController) Bind(router *gin.Engine) {
	log.Println("Bind RedirectController")
	router.POST("/redirect", controller.redirect)
}