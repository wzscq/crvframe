package operationlog

import (
  "github.com/gin-gonic/gin"
	"log"
	"strings"
	"encoding/json"
	"time"
	"crv/frame/common"
)

func OperationLogMiddleware(repo OperationLogRepository,apps []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Print("OperationLogMiddleware start")
		appDB:= c.MustGet("appDB").(string)
		writeLog:=false

		if strings.Index(c.Request.URL.Path,"/user/login") ==0 || 
		   strings.Index(c.Request.URL.Path,"/user/logout") ==0{
			for _,app:=range apps {
				if app == appDB {
					writeLog=true
					break
				}
			}
		}

		if writeLog==false {
			c.Next()
			log.Print("OperationLogMiddleware end without record log")
			return
		}

		userID:= c.MustGet("userID").(string)
		writer:= newResponseWriter(c.Writer)
		c.Writer=writer
		
		c.Next()

		if strings.Index(c.Request.URL.Path,"/user/login") ==0 {
			
			if(c.Writer.Written()){
				contentType := c.Writer.Header().Get("Content-Type")
				if contentType == "application/json" {
					//获取当前时间
					now:=time.Now().Format("2006-01-02 15:04:05")

					opLog:=OperationLog{
						OperationType:"login",
						SourceType:"login",
						IP:"",
						Result:"success", 
						CreateTime:now,
						CreateUser:userID,
						UpdateTime:now,
						UpdateUser:userID,
					}

					var rsp common.CommonRsp
					if err := json.Unmarshal(writer.body.Bytes(), &rsp); err != nil {
							log.Println(err)
							opLog.Result="fail"
					} else {
							// Now you can use your data
							if rsp.Error==true {
								opLog.Result="fail"
							}
					}

					repo.CreateOperationLog(appDB,opLog)
				}
			}
		}

		if strings.Index(c.Request.URL.Path,"/user/logout") ==0 {
			if(c.Writer.Written()){
				contentType := c.Writer.Header().Get("Content-Type")
				if contentType == "application/json" {
					//获取当前时间
					now:=time.Now().Format("2006-01-02 15:04:05")

					opLog:=OperationLog{
						OperationType:"logout",
						SourceType:"login",
						IP:"",
						Result:"success", 
						CreateTime:now,
						CreateUser:userID,
						UpdateTime:now,
						UpdateUser:userID,
					}

					var rsp common.CommonRsp
					if err := json.Unmarshal(writer.body.Bytes(), &rsp); err != nil {
							log.Println(err)
							opLog.Result="fail"
					} else {
							if rsp.Error==true {
								opLog.Result="fail"
							}
					}

					repo.CreateOperationLog(appDB,opLog)
				}
			}
		}

		log.Print("OperationLogMiddleware end")
	}
}