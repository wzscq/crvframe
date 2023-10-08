package definition

import (
	"log/slog"
	"os"
	"io"
	"github.com/gin-gonic/gin"
	"crv/frame/common"
	"net/http"
)

type getModelViewRep struct {
	ModelID string `json:"modelID"`
	Views *[]string `json:"views,omitempty"`
}

type getModelFormRep struct {
	ModelID string `json:"modelID"`
	FormID string `json:"formID"`
}

type getReportConfReq struct {
	ReportID string  `json:"reportID"`
}

type getAPPConfReq struct {
	AppID string  `json:"appID"`
}

type DefinitionController struct {
	 
}

func (controller *DefinitionController)getUserFunction(c *gin.Context){
	slog.Debug("start definition getUserFunction")
	//获取用户角色
	userRoles:= c.MustGet("userRoles").(string)
	appDB:= c.MustGet("appDB").(string)
	
	f:=function{
		AppDB:appDB,
	}

	functions,errorCode:=f.getUserFunction(userRoles)
	
	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),functions)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end definition getUserFunction")
}

func (controller *DefinitionController)getUserMenus(c *gin.Context){
	slog.Debug("start definition getUserMenus")
	//获取用户角色
	userRoles:= c.MustGet("userRoles").(string)
	appDB:= c.MustGet("appDB").(string)
	
	m:=menu{
		AppDB:appDB,
	}

	menus,errorCode:=m.getUserMenus(userRoles)
	
	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),menus)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end definition getUserMenus")
}

func (controller *DefinitionController)getModelViewConf(c *gin.Context){
	slog.Debug("start definition getModelViewConf")
	//获取用户角色
	userRoles:= c.MustGet("userRoles").(string)
	appDB:= c.MustGet("appDB").(string)
	
	var mvConf modelViewConf
	var rep getModelViewRep	
	if err := c.BindJSON(&rep); err != nil {
		slog.Error("end definition getModelViewConf with error","error",err)
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),mvConf)
		c.IndentedJSON(http.StatusOK, rsp)
		return
	} 

	m:=model{
		AppDB:appDB,
	}

	var errorCode int
	mvConf,errorCode=m.getModelViewConf(rep.ModelID,rep.Views,userRoles)

	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),mvConf)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end definition getModelViewConf")
}

func (controller *DefinitionController)getModelFormConf(c *gin.Context){
	slog.Debug("start definition getModelFormConf")
	//获取用户角色
	userRoles:= c.MustGet("userRoles").(string)
	appDB:= c.MustGet("appDB").(string)
	
	var mvConf modelFormConf
	var rep getModelFormRep	
	if err := c.BindJSON(&rep); err != nil {
		slog.Error("end definition getModelFormConf with error","error",err)
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),mvConf)
		c.IndentedJSON(http.StatusOK, rsp)
		return
	}

	m:=model{
		AppDB:appDB,
	}

	var errorCode int
	mvConf,errorCode=m.getModelFormConf(rep.ModelID,rep.FormID,userRoles)

	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),mvConf)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end definition getModelFormConf")
}

func (controller *DefinitionController)getReportConf(c *gin.Context){
	slog.Debug("start definition getReportConf")
	//获取用户角色
	appDB:= c.MustGet("appDB").(string)
	
	var req getReportConfReq	
	if err := c.BindJSON(&req); err != nil {
		slog.Error("end definition getReportConf with error","error",err)
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		return
	}

	reportConf,errorCode:=getReportConf(appDB,req.ReportID)

	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),reportConf)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end definition getReportConf")
}

func (controller *DefinitionController)getAppImage(c *gin.Context){
	slog.Debug("start definition getAppImage")

	appDB:= c.MustGet("appDB").(string)
	image := c.Param("image")
	imageFile := "apps/"+appDB+"/images/"+image	
	
	f,err:=os.Open(imageFile)
	if err != nil {
		slog.Error("end definition getAppImage with error","error",err)
		return
	}

	io.Copy(c.Writer,f)
	if err := f.Close(); err != nil {
		slog.Error("end definition getAppImage with error","error",err)
	}
	slog.Debug("end definition getAppImage")
}

func (controller *DefinitionController)getAppI18n(c *gin.Context){
	slog.Debug("start definition getAppI18n")
	appDB:= c.MustGet("appDB").(string)
	locale := c.Param("locale")
	
	i18n:=i18n{
		AppDB:appDB,
		Locale:locale,
	}	
	appI18n,errorCode:=i18n.getAppI18n()
	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),appI18n)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end definition getAppI18n")
}

func (controller *DefinitionController)getAPPConf(c *gin.Context){
	slog.Debug("start definition getAPPConf")
	appDB:= c.MustGet("appDB").(string)
	
	var req getAPPConfReq	
	if err := c.BindJSON(&req); err != nil {
		slog.Error("end definition getAPPConf with error","error",err)
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		return
	}

	appConf,err:=GetAPPConf(appDB)
	if err != nil {
		rsp:=common.CreateResponse(err,nil)
		c.IndentedJSON(http.StatusOK, rsp)
		return
	}

	rsp:=common.CreateResponse(nil,appConf)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end definition getAPPConf")
}

func (controller *DefinitionController) Bind(router *gin.Engine) {
	slog.Info("Bind DefinitionController")
	router.POST("/definition/getUserMenus", controller.getUserMenus)
	router.POST("/definition/getUserFunction", controller.getUserFunction)
	router.POST("/definition/getModelViewConf", controller.getModelViewConf)
	router.POST("/definition/getModelFormConf", controller.getModelFormConf)
	router.POST("/definition/getReportConf", controller.getReportConf)
	router.POST("/definition/getAPPConf", controller.getAPPConf)
	router.GET("/appimages/:appId/:image", controller.getAppImage)
	router.GET("/appI18n/:appId/:locale", controller.getAppI18n)
}