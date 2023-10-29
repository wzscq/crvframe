package oauth

import (
	"log/slog"
	"github.com/gin-gonic/gin"
	"crv/frame/common"
	"crv/frame/definition"
	"crv/frame/user"
	"net/http"
)

type getLoginPageReq struct {
	AppID     string   `json:"appID"`
}

type getLoginPageRsp struct {
	Url     string   `json:"url"`
}

type oauthLoginReq struct {
	UserID     string  `json:"userID"`
    Password  string   `json:"password"`
	AppID     string   `json:"appID"`
	RedirectUri string   `json:"redirectUri"`
	ClientID string `json:"clientID"`
}

type oauthBackReq struct {
    OAuthCode  string   `json:"oauthCode"`
	AppID     string   `json:"appID"`
}

type accessTokenReq struct {
	ClientID string `form:"client_id"`
	ClientSecret string `form:"client_secret"`
	Code string `form:"code"`
}

type userInfoReq struct {
	Authorization string `json:"Authorization"`
}

type OAuthController struct {
	AppCache common.AppCache
	UserRepository user.UserRepository
	OAuthCache *OAuthCache
	LoginCache common.LoginCache
	LoginLogApps map[string]bool
}

const (
	API_OAUTH2_AUTHORIZE="oauth2_authorize"
	API_OAUTH2_ACCESSTOKEN="oauth2_accessToken"
	API_OAUTH2_USERINFO="oauth2_userInfo"
)

func (controller *OAuthController) getLoginPage(c *gin.Context) {
	slog.Debug("start OAuthController getLoginPage")
	var req getLoginPageReq
	var errorCode int
	if err := c.BindJSON(&req); err != nil {
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end OAuthController getLoginPage with error","error",err)
		return 
  }
		
	slog.Debug("request content","req",req)
	var appDB string
	appDB,errorCode=getAppDB(controller.AppCache,req.AppID)
	if(errorCode != common.ResultSuccess){
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end OAuthController getLoginPage with error","errorCode",errorCode)
		return
	}

	url,errorCode:=definition.GetApiUrl(appDB,API_OAUTH2_AUTHORIZE)
	if(errorCode != common.ResultSuccess){
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end OAuthController getLoginPage with error","errorCode",errorCode)
		return
	}

	result:=&getLoginPageRsp{
		Url:url,
	}

	rsp:=common.CreateResponse(nil,result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end OAuthController getLoginPage")
}

func (controller *OAuthController)login(c *gin.Context) {
	slog.Debug("start OAuthController login")
	var req oauthLoginReq
	var errorCode int
	if err := c.BindJSON(&req); err != nil {
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end OAuthController login with error","error",err)
		return 
    }

	slog.Debug("request content","req",req)
	var appDB string
	appDB,errorCode=getAppDB(controller.AppCache,req.AppID)
	if(errorCode != common.ResultSuccess){
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end OAuthController login with error","errorCode",errorCode)
		return
	}
	
	token,errorCode:=oauthLogin(
		controller.OAuthCache,
		controller.UserRepository,
		appDB,req.UserID,req.Password,req.ClientID)
	if(errorCode != common.ResultSuccess){
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end OAuthController login with error","errorCode",errorCode)
		return
	}

	//重定向web到给定的回调地址
	url:=req.RedirectUri+"?code="+token
	c.Redirect(http.StatusMovedPermanently, url)
	slog.Debug("end OAuthController login")
}

func (controller *OAuthController)back(c *gin.Context) {
	slog.Debug("start OAuthController back")
	var req oauthBackReq
	if err := c.BindJSON(&req); err != nil {
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end OAuthController back with error","error",err)
		return 
  }
		
	slog.Debug("request content","req",req)
	appDB,errorCode:=getAppDB(controller.AppCache,req.AppID)
	if(errorCode != common.ResultSuccess){
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end OAuthController back with error","errorCode",errorCode)
		return
	}
	
	//获取oauth access token
	token,err:=getAccessToken(appDB,req.OAuthCode)
	if err!=nil {
		rsp:=common.CreateResponse(err,nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end OAuthController back with error","error",err)
		return
	}

	//获取oauth user id
	userID,err:=getUserID(appDB,token)
	if err!=nil {
		rsp:=common.CreateResponse(err,nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end OAuthController back with error","error",err)
		return
	}
	slog.Info("get userid","userid",userID)
	ip:=user.GetIP(c)
	//获取本地用户信息，生成本地token，
	result,err:=localLogin(controller.UserRepository,controller.LoginCache,req.AppID,appDB,userID,ip,controller.LoginLogApps)
	if err!=nil {
		rsp:=common.CreateResponse(err,nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end OAuthController back with error","error",err)
		return
	}
	
	rsp:=common.CreateResponse(nil,result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end OAuthController back")
}

func (controller *OAuthController)accessToken(c *gin.Context){
	//这里暂时不对client密码做校验
	slog.Debug("start OAuthController accessToken")
	var req accessTokenReq
	if err := c.ShouldBind(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, nil)
		slog.Error("end OAuthController accessToken with error","error",err)
		return 
  }	
	slog.Debug("request content","req",req)
	//这里不做处理，直接将code作为token返回
	token:=&OauthToken{
		AccessToken:req.Code,
	}
	//rsp:=common.CreateResponse(nil,token)
	c.IndentedJSON(http.StatusOK, token)
	slog.Debug("end OAuthController accessToken")
}

func (controller *OAuthController)userInfo(c *gin.Context){
	slog.Debug("start OAuthController userInfo")
	var req userInfoReq
	if err := c.ShouldBindHeader(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, nil)
		slog.Error("end OAuthController userInfo with error","error",err)
		return 
  }	
	slog.Debug("request content","req",req)
	if len(req.Authorization)<7 {
		c.IndentedJSON(http.StatusBadRequest, nil)
		slog.Error("end OAuthController userInfo with error","error","OAuthController userInfo request token is too short")
		return 
	}
	token:=req.Authorization[6:]
	slog.Debug("token is","token",token)
	
	userID,err:=controller.OAuthCache.GetUserID(token)
	if err!=nil {
		slog.Error("OAuthController userInfo GetUserID error","error",err)
		c.IndentedJSON(http.StatusBadRequest, nil)
		return 
	}

	result:=map[string]string{
		"loginName":userID,
	}
	//rsp:=common.CreateResponse(nil,token)
	c.IndentedJSON(http.StatusOK, result)
	slog.Debug("end OAuthController userInfo")
}

func (controller *OAuthController) Bind(router *gin.Engine) {
	slog.Info("Bind OAuthController")
	router.POST("/oauth/getLoginPage", controller.getLoginPage)
	router.POST("/oauth/login", controller.login)
	router.POST("/oauth/back", controller.back)
	router.POST("/oauth/accessToken", controller.accessToken)
	router.GET("/oauth/userInfo", controller.userInfo)
}