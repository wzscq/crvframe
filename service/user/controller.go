package user

import (
	"log/slog"
	"github.com/gin-gonic/gin"
	"crv/frame/common"
	"crv/frame/definition"
	"database/sql"
	"net/http"
)

type UserController struct {
	UserRepository UserRepository
	LoginCache common.LoginCache 
	AppCache common.AppCache
	LoginLogApps map[string]bool
}

type repHeader struct {
	Token     string  `json:"token"`
}

type loginRep struct {
    UserID     string  `json:"userID"`
    Password  string   `json:"password"`
		AppID     string   `json:"appID"`
}

type changePasswordRep struct {
	Password  string  `json:"password"`
	NewPassword  string  `json:"newPassword"`
}

type LoginResult struct {
    UserID     string  `json:"userID"`
    UserName  *string  `json:"userName"`
		Token     string  `json:"token"`
		AppID     string  `json:"appID"`
		InitOperations []definition.OperationConf `json:"initOperations"`
		AppConf  map[string]interface{} `json:"appConf"`
}

func (controller *UserController)checkUserPassword(userID string,password string,dbName string)(*User,int){
	user,err:=controller.UserRepository.GetUser(userID,dbName)
	if err != nil {
		if err == sql.ErrNoRows {
			return user,common.ResultWrongUserPassword
		}
		return user,common.ResultAccessDBError
	}
		
	if password != user.Password {
		return user,common.ResultWrongUserPassword
	}	
	
	return user,common.ResultSuccess
}

func (controller *UserController)getUserRoles(userID string,dbName string)(string,int){
	roles,err:=controller.UserRepository.GetUserRoles(userID,dbName)
	if err != nil {
		if err == sql.ErrNoRows {
			return "",common.ResultNoUserRole
		}
		return "",common.ResultAccessDBError
	}
		
	return roles,common.ResultSuccess
}

func (controller *UserController)cacheLoginToken(userID string,token string,appDB string,userRoles string)(int){
	controller.LoginCache.RemoveUser(appDB,userID)
			
	err:=controller.LoginCache.SetCache(userID,token,appDB,userRoles)
	if err != nil {
		slog.Error(err.Error())
		return common.ResultCreateTokenError
	}
		
	return common.ResultSuccess
}

func (controller *UserController)getAppDB(appID string)(string,int){
	slog.Debug("start user getAppDB")
	appDB,err:=controller.AppCache.GetAppDB(appID)
	if err != nil {
		slog.Error(err.Error())
		return "",common.ResultAppDBError
	}
	slog.Debug("end user getAppDB","appDB",appDB)
	return appDB,common.ResultSuccess
}

func (controller *UserController)login(c *gin.Context) {
	slog.Debug("start user login")
	var rep loginRep
	var errorCode int
	if err := c.BindJSON(&rep); err != nil {
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end user login with error","error",err)
		return 
  }
		
	slog.Debug("request content","req",rep)
	var appDB string
	appDB,errorCode=controller.getAppDB(rep.AppID)
	if(errorCode != common.ResultSuccess){
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end user login with error","errorCode",errorCode,"message",rsp.Message)
		return
	}

	ip:=GetIP(c)
	var user *User
	user,errorCode=controller.checkUserPassword(rep.UserID,rep.Password,appDB)
	if(errorCode != common.ResultSuccess){
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end user login with error","errorCode",errorCode,"message",rsp.Message)
		WriteLoginLog(appDB,ip,rep.UserID,"fail",controller.UserRepository,controller.LoginLogApps)
		return
	}

	userRoles,errorCode:=controller.getUserRoles(rep.UserID,appDB)
	if(errorCode != common.ResultSuccess){
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end user login with error","errorCode",errorCode,"message",rsp.Message)
		WriteLoginLog(appDB,ip,rep.UserID,"fail",controller.UserRepository,controller.LoginLogApps)
		return
	}
	
	token:=GetLoginToken()
	errorCode=controller.cacheLoginToken(rep.UserID,token,appDB,userRoles)
	var result *LoginResult
	if errorCode == common.ResultSuccess {
		//获取当前用户的初始操作
		initOperations:=definition.GetOperations(appDB,userRoles)
		//获取应用配置信息
		appConf,_:=definition.GetAPPConf(appDB,rep.UserID,userRoles)

		result=&LoginResult{
			UserID:user.UserID,
			UserName:user.UserNameZh,
			Token:common.EncodeToken(token),
			AppID:rep.AppID,
			InitOperations:initOperations,
			AppConf:appConf,
		}
		WriteLoginLog(appDB,ip,rep.UserID,"success",controller.UserRepository,controller.LoginLogApps)
	} else {
		WriteLoginLog(appDB,ip,rep.UserID,"fail",controller.UserRepository,controller.LoginLogApps)
	}

	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end user login")
}

func (controller *UserController) logout(c *gin.Context) {
	slog.Debug("start user logout")
	userID:= c.MustGet("userID").(string)
	appDB:= c.MustGet("appDB").(string)
	controller.LoginCache.RemoveUser(appDB,userID)
	errorCode:=common.ResultSuccess
	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
	c.IndentedJSON(http.StatusOK, rsp)

	ip:=GetIP(c)
	WriteLogoutLog(appDB,ip,userID,"success",controller.UserRepository,controller.LoginLogApps)

	slog.Debug("end user logout")
}

func (controller *UserController) changePassword(c *gin.Context) {
	slog.Debug("start user changePassword")
	var errorCode int
	var rep changePasswordRep	
	if err := c.BindJSON(&rep); err != nil {
		slog.Error(err.Error())
		errorCode=common.ResultWrongRequest
	} else {
		slog.Debug("request conent","req",rep)
		userID:= c.MustGet("userID").(string)
		appDB:= c.MustGet("appDB").(string)
		_,errorCode=controller.checkUserPassword(userID,rep.Password,appDB)
		if errorCode == common.ResultSuccess {
			//更新密码到数据库
			err:=controller.UserRepository.updatePassword(userID,rep.NewPassword,appDB)
			if err!=nil {
				errorCode=common.ResultAccessDBError
			}
		}
	}
	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end user changePassword")
}

func (controller *UserController) Bind(router *gin.Engine) {
	slog.Info("Bind UserController")
	router.POST("/user/login", controller.login)
	router.POST("/user/logout", controller.logout)
	router.POST("/user/changePassword", controller.changePassword)
}