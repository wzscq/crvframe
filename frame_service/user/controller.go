package user

import (
	"log"
	"github.com/gin-gonic/gin"
	"crv/frame/common"
	"database/sql"
	"net/http"
)

type UserController struct {
	UserRepository UserRepository
	LoginCache common.LoginCache 
	AppCache common.AppCache
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

type loginResult struct {
    UserID     string  `json:"userID"`
    UserName  *string  `json:"userName"`
	Token     string  `json:"token"`
	AppID     string  `json:"appID"`
}

func (controller *UserController)checkUserPassword(userID string,password string,dbName string)(*User,int){
	user,err:=controller.UserRepository.getUser(userID,dbName)
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
	roles,err:=controller.UserRepository.getUserRoles(userID,dbName)
	if err != nil {
		if err == sql.ErrNoRows {
			return "",common.ResultNoUserRole
		}
		return "",common.ResultAccessDBError
	}
		
	return roles,common.ResultSuccess
}

func (controller *UserController)cacheLoginToken(userID string,token string,appDB string,userRoles string)(int){
	controller.LoginCache.RemoveUser(userID)
			
	err:=controller.LoginCache.SetCache(userID,token,appDB,userRoles)
	if err != nil {
		log.Println(err)
		return common.ResultCreateTokenError
	}
		
	return common.ResultSuccess
}

func (controller *UserController)getAppDB(appID string)(string,int){
	log.Println("start user getAppDB")
	appDB,err:=controller.AppCache.GetAppDB(appID)
	if err != nil {
		log.Println(err)
		return "",common.ResultAppDBError
	}
	log.Println(appDB)
	log.Println("end user getAppDB")
	return appDB,common.ResultSuccess
}

func (controller *UserController)login(c *gin.Context) {
	log.Println("start user login")
	var rep loginRep
	var errorCode int
	var result *loginResult
	if err := c.BindJSON(&rep); err != nil {
		log.Println(err)

		rsp:=common.CreateResponse(common.ResultWrongRequest,result)
		c.IndentedJSON(http.StatusOK, rsp.Rsp)
		log.Println("end user login with error")
		return 
    }
		
	log.Println(rep)
	var appDB string
	appDB,errorCode=controller.getAppDB(rep.AppID)
	if(errorCode != common.ResultSuccess){
		rsp:=common.CreateResponse(errorCode,result)
		c.IndentedJSON(http.StatusOK, rsp.Rsp)
		log.Println("end user login with error")
		return
	}
	
	var user *User
	user,errorCode=controller.checkUserPassword(rep.UserID,rep.Password,appDB)
	if(errorCode != common.ResultSuccess){
		rsp:=common.CreateResponse(errorCode,result)
		c.IndentedJSON(http.StatusOK, rsp.Rsp)
		log.Println("end user login with error")
		return
	}

	userRoles,errorCode:=controller.getUserRoles(rep.UserID,appDB)
	if(errorCode != common.ResultSuccess){
		rsp:=common.CreateResponse(errorCode,result)
		c.IndentedJSON(http.StatusOK, rsp.Rsp)
		log.Println("end user login with error")
		return
	}
	
	token:=GetLoginToken()
	errorCode=controller.cacheLoginToken(rep.UserID,token,appDB,userRoles)
	if errorCode == common.ResultSuccess {
		result=&loginResult{
			UserID:user.UserID,
			UserName:user.UserNameZh,
			Token:token,
			AppID:rep.AppID,
		}
	}
		
	rsp:=common.CreateResponse(errorCode,result)
	c.IndentedJSON(http.StatusOK, rsp.Rsp)
	log.Println("end user login")
}

func (controller *UserController) logout(c *gin.Context) {
	log.Println("start user logout")
	userID:= c.MustGet("userID").(string)
	controller.LoginCache.RemoveUser(userID)
	errorCode:=common.ResultSuccess
	rsp:=common.CreateResponse(errorCode,nil)
	c.IndentedJSON(http.StatusOK, rsp.Rsp)
	log.Println("end user logout")
}

func (controller *UserController) changePassword(c *gin.Context) {
	log.Println("start user changePassword")
	var errorCode int
	var rep changePasswordRep	
	if err := c.BindJSON(&rep); err != nil {
		log.Println(err)
		errorCode=common.ResultWrongRequest
	} else {
		log.Println(rep)
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
	rsp:=common.CreateResponse(errorCode,nil)
	c.IndentedJSON(http.StatusOK, rsp.Rsp)
	log.Println("end user changePassword")
}

func (controller *UserController) Bind(router *gin.Engine) {
	log.Println("Bind UserController")
	router.POST("/user/login", controller.login)
	router.POST("/user/logout", controller.logout)
	router.POST("/user/changePassword", controller.changePassword)
}