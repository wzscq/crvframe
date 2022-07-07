package definition

import (
	"log"
	"os"
	"io"
	"github.com/gin-gonic/gin"
	"crv/frame/common"
	"net/http"
)

type getModelViewRep struct {
	ModelID string `json:"modelID"`
}

type getModelFormRep struct {
	ModelID string `json:"modelID"`
	FormID string `json:"formID"`
}

type DefinitionController struct {
	 
}

func (controller *DefinitionController)getUserFunction(c *gin.Context){
	log.Println("start definition getUserFunction")
	//获取用户角色
	userRoles:= c.MustGet("userRoles").(string)
	appDB:= c.MustGet("appDB").(string)
	
	f:=function{
		AppDB:appDB,
	}

	functions,errorCode:=f.getUserFunction(userRoles)
	
	rsp:=common.CreateResponse(errorCode,functions)
	c.IndentedJSON(http.StatusOK, rsp.Rsp)
	log.Println("end definition getUserFunction")
}

func (controller *DefinitionController)getModelViewConf(c *gin.Context){
	log.Println("start definition getModelViewConf")
	//获取用户角色
	userRoles:= c.MustGet("userRoles").(string)
	appDB:= c.MustGet("appDB").(string)
	
	var mvConf modelViewConf
	var rep getModelViewRep	
	if err := c.BindJSON(&rep); err != nil {
		log.Println(err)
		rsp:=common.CreateResponse(common.ResultWrongRequest,mvConf)
		c.IndentedJSON(http.StatusOK, rsp.Rsp)
		log.Println("end definition getModelViewConf with error")
		return
	} 

	m:=model{
		AppDB:appDB,
	}

	var errorCode int
	mvConf,errorCode=m.getModelViewConf(rep.ModelID,userRoles)

	rsp:=common.CreateResponse(errorCode,mvConf)
	c.IndentedJSON(http.StatusOK, rsp.Rsp)
	log.Println("end definition getModelViewConf")
}

func (controller *DefinitionController)getModelFormConf(c *gin.Context){
	log.Println("start definition getModelFormConf")
	//获取用户角色
	userRoles:= c.MustGet("userRoles").(string)
	appDB:= c.MustGet("appDB").(string)
	
	var mvConf modelFormConf
	var rep getModelFormRep	
	if err := c.BindJSON(&rep); err != nil {
		log.Println(err)
		rsp:=common.CreateResponse(common.ResultWrongRequest,mvConf)
		c.IndentedJSON(http.StatusOK, rsp.Rsp)
		log.Println("end definition getModelFormConf with error")	
	}

	m:=model{
		AppDB:appDB,
	}

	var errorCode int
	mvConf,errorCode=m.getModelFormConf(rep.ModelID,rep.FormID,userRoles)

	rsp:=common.CreateResponse(errorCode,mvConf)
	c.IndentedJSON(http.StatusOK, rsp.Rsp)
	log.Println("end definition getModelViewConf")
}

func (controller *DefinitionController)getAppImage(c *gin.Context){
	log.Println("start definition getAppImage")

	appDB:= c.MustGet("appDB").(string)
	image := c.Param("image")
	imageFile := "apps/"+appDB+"/images/"+image	
	
	f,err:=os.Open(imageFile)
	if err != nil {
		log.Println(err)
		log.Println("end definition getAppImage")	
		return
	}

	io.Copy(c.Writer,f)
	if err := f.Close(); err != nil {
		log.Println(err)
	}
	log.Println("end definition getAppImage")
}

func (controller *DefinitionController)getAppI18n(c *gin.Context){
	log.Println("start definition getAppI18n")
	appDB:= c.MustGet("appDB").(string)
	locale := c.Param("locale")
	
	i18n:=i18n{
		AppDB:appDB,
		Locale:locale,
	}	
	appI18n,errorCode:=i18n.getAppI18n()
	rsp:=common.CreateResponse(errorCode,appI18n)
	c.IndentedJSON(http.StatusOK, rsp.Rsp)
	log.Println("end definition getAppI18n")
}

func (controller *DefinitionController) Bind(router *gin.Engine) {
	log.Println("Bind DefinitionController")
	router.POST("/definition/getUserFunction", controller.getUserFunction)
	router.POST("/definition/getModelViewConf", controller.getModelViewConf)
	router.POST("/definition/getModelFormConf", controller.getModelFormConf)
	router.GET("/appimages/:appId/:image", controller.getAppImage)
	router.GET("/appI18n/:appId/:locale", controller.getAppI18n)
}