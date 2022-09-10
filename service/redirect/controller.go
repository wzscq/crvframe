package redirect

import (
	"log"
	"github.com/gin-gonic/gin"
	"crv/frame/common"
	"crv/frame/definition"
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
	UserID string `json:"userID"`
	AppDB string `json:"appDB"`
	UserRoles string `json:"userRoles"`
	FlowID string `json:"flowID"`
	//Fields *[]field `json:"fields"`
	//Sorter *[]sorter `json:"sorter"`
	SelectedRowKeys *[]string `json:"selectedRowKeys"`
	//Pagination *pagination `json:"pagination"`
}

type RedirectController struct {
	 
}

func (controller *RedirectController)redirect(c *gin.Context){
	log.Println("start redirect ")

	userID:= c.MustGet("userID").(string)
	userRoles:= c.MustGet("userRoles").(string)
	appDB:= c.MustGet("appDB").(string)
			
	var rep commonRep
	if err := c.BindJSON(&rep); err != nil {
		log.Println(err)
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end redirect with error")
		return
    }
		
	if rep.To==nil{
		rsp:=common.CreateResponse(common.CreateError(common.ResultNoExternalApiId,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end redirect with error")
		return
	}

	//get url
	postUrl,errorCode:=definition.GetApiUrl(appDB,*rep.To)
	if errorCode != common.ResultSuccess {
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		return 
	}

	rep.UserID=userID
	rep.AppDB=appDB
	rep.UserRoles=userRoles
	rep.To=nil
	postJson,_:=json.Marshal(rep)
	postBody:=bytes.NewBuffer(postJson)
	log.Println("http.Post ",postUrl,string(postJson))
	resp,err:=http.Post(postUrl,"application/json",postBody)

	if err != nil || resp==nil || resp.StatusCode != 200 { 
		log.Println(resp)
		rsp:=common.CreateResponse(common.CreateError(common.ResultPostExternalApiError,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		return 
	}

	log.Println("resp",resp)
	defer resp.Body.Close()
	rsp:=common.CreateResponse(nil,nil)
	c.IndentedJSON(http.StatusOK, rsp)
	log.Println("end redirect success")
}

func (controller *RedirectController) Bind(router *gin.Engine) {
	log.Println("Bind RedirectController")
	router.POST("/redirect", controller.redirect)
}