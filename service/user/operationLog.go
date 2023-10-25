package user

import (
	"time"
	"github.com/gin-gonic/gin"
)

func WriteLoginLog(appDB,ip,userID,result string,repo UserRepository,appMap map[string]bool){
	writeLog,exist:=appMap[appDB]
	if exist==false || writeLog==false {
		return
	}

	now:=time.Now().Format("2006-01-02 15:04:05")
	opLog:=OperationLog{
		OperationType:"login",
		SourceType:"login",
		IP:ip,
		Result:result, 
		CreateTime:now,
		CreateUser:userID,
		UpdateTime:now,
		UpdateUser:userID,
	}
	repo.CreateOperationLog(appDB,opLog)
}

func WriteLogoutLog(appDB,ip,userID,result string,repo UserRepository,appMap map[string]bool){
	writeLog,exist:=appMap[appDB]
	if exist==false || writeLog==false {
		return
	}

	now:=time.Now().Format("2006-01-02 15:04:05")
	opLog:=OperationLog{
		OperationType:"logout",
		SourceType:"login",
		IP:ip,
		Result:result, 
		CreateTime:now,
		CreateUser:userID,
		UpdateTime:now,
		UpdateUser:userID,
	}
	repo.CreateOperationLog(appDB,opLog)
}

func GetIP(c *gin.Context) string {
	ip := c.Request.Header.Get("X-Real-Ip")
	if ip == "" {
			ip = c.Request.Header.Get("X-Forwarded-For")
	}
	if ip == "" {
			ip = c.Request.RemoteAddr
	}
	return ip
}