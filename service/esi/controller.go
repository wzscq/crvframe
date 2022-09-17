package esi

import (
	"log"
	"github.com/gin-gonic/gin"
	"crv/frame/common"
	"crv/frame/data"
	"net/http"
)

type commonReq struct {
	ModelID string `json:"modelID,omitempty"`
	List []map[string]interface{} `json:"list,omitempty"`
	Specific string  `json:"specific,omitempty"` 
}

type EsiController struct {
	DataRepository data.DataRepository
}

func (controller *EsiController)esiImport(c *gin.Context){
	log.Println("EsiController import start")

	//获取相关参数
	userRoles:= c.MustGet("userRoles").(string)
	userID:= c.MustGet("userID").(string)
	appDB:= c.MustGet("appDB").(string)

	var req commonReq
	var errorCode int
	if err := c.BindJSON(&req); err != nil {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("EsiController import end with error:")
		log.Println(err)
		return
    }

	log.Printf("loadESIModel model:%s,Specific:%s",req.ModelID,req.Specific)

	if len(req.ModelID)==0 {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("EsiController import end with error:")
		log.Println("modelDI is nil")
		return
	}

	if len(req.List)==0 {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("EsiController import end with error:")
		log.Println("list is empty")
		return
	}

	//获取esiFile
	fileField,ok:=req.List[0]["esiFile"]
	if !ok {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("EsiController import end with error:")
		log.Println("the field esiFile is not found.")
		return
	}

	fileValueMap,ok:=fileField.(map[string]interface{})
	if !ok {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("EsiController import end with error:")
		log.Println("can not onvert esiFile value to map[stirng]interface{}.")
		return
	}

	listField,ok:=fileValueMap["list"]
	if !ok {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("EsiController import end with error:")
		log.Println("the field esiFile.list is not found.")
		return
	}

	esiFileList,ok:=listField.([]interface{})
	if !ok {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("EsiController import end with error:")
		log.Println("can not onvert esiFile.list to []interface{}.")
		return
	}

	if len(esiFileList)==0 {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("EsiController import end with error:")
		log.Println("esiFile.list is empty.")
		return
	}

	esiFileRow,ok:=esiFileList[0].(map[string]interface{})
	if !ok {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("EsiController import end with error:")
		log.Println("can not onvert esiFile.list[0] to map[stirng]interface{}.")
		return
	}

	//拿到文件名和文件内容
	fileNameIntreface,ok:=esiFileRow["name"]
	if !ok {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("EsiController import end with error:")
		log.Println("the field esiFile.list[0].name is not found.")
		return
	}
	fileName,ok:=fileNameIntreface.(string)
	if !ok {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("EsiController import end with error:")
		log.Println("can not onvert esiFile.list[0].name to string.")
		return
	}

	fileContentInterface,ok:=esiFileRow["contentBase64"]
	if !ok {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("EsiController import end with error:")
		log.Println("the field esiFile.list[0].contentBase64 is not found.")
		return
	}
	fileContent,ok:=fileContentInterface.(string)
	if !ok {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("EsiController import end with error:")
		log.Println("can not onvert esiFile.list[0].contentBase64 to string.")
		return
	}

	esiImport:=&esiImport{
		AppDB:appDB,
		ModelID:req.ModelID,
		UserID:userID,
		UserRoles:userRoles,
		Specific:req.Specific,
		FileName:fileName,
		FileContent:fileContent,
		DataRepository:controller.DataRepository,
	}

	result,commonErr:=esiImport.doImport()
	rsp:=common.CreateResponse(commonErr,result)
	c.IndentedJSON(http.StatusOK, rsp)
	log.Println("EsiController import end")
}

func (controller *EsiController) Bind(router *gin.Engine) {
	log.Println("Bind EsiController")
	router.POST("/esi/import", controller.esiImport)
}