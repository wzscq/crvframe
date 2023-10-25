package operationlog

import (
  "github.com/gin-gonic/gin"
	"gopkg.in/natefinch/lumberjack.v2"
	//"fmt"
	"crv/frame/common"
	"bytes"
	"log/slog"
	"io/ioutil"
	"time"
)

func Init(router *gin.Engine,fileOptions *common.FileOptionConf,appMap map[string]bool) {
	if appMap!=nil {
		opLog:=OperationLogMiddleware(fileOptions,appMap)
		dataGroup := router.Group("/data/")
		dataGroup.Use(opLog)
		apiGroup:=router.Group("/redirect")
		apiGroup.Use(opLog)
		user:=router.Group("/user")
		user.Use(opLog)
	}
}

func OperationLogMiddleware(fileOptions *common.FileOptionConf,appMap map[string]bool) gin.HandlerFunc {
	opLog:=OperationLog{
		FileOptions:fileOptions,
		AppLogs:make(map[string]*lumberjack.Logger),
	}

	opItem:=OplogItem{}

	return func(c *gin.Context) {		
		appDB,exist:=c.Get("appDB")
		if exist==false {
			c.Next()
			return
		}

		writeLog,exist:=appMap[appDB.(string)]
		if exist==false || writeLog==false {
			c.Next()
			return
		}

		userID,exist:= c.Get("userID")
		if exist==false {
			c.Next()
			return
		}

		opItem.AppDB=appDB.(string)
		opItem.UserID=userID.(string)
		opItem.RequestTime=time.Now().Format("2006-01-02 15:04:05")
		opItem.Url=c.Request.URL.String()
		opItem.RequestContentType = c.Request.Header.Get("Content-Type")

		if opItem.RequestContentType=="application/json" {
			// 请求数据
			bodyBytes, err := ioutil.ReadAll(c.Request.Body)
			if err != nil {
				slog.Error("Error reading body: %!s","error",err)
				c.Next()
				return
			}

			// 把读出来的 body 写回去
			c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))
			// 输出请求数据和请求地址
			//fmt.Println("[Request]", appDB,userID,c.Request.URL,bodyBytes)
			opItem.RequestBody=string(bodyBytes)
		}
		
		writer := &responseWriter{body: bytes.NewBufferString(""), ResponseWriter: c.Writer}
		c.Writer = writer
		
		c.Next()
		
		c.Writer = writer.ResponseWriter

		status := c.Writer.Status()
		opItem.ResponseStatus=status
		opItem.ResponseTime=time.Now().Format("2006-01-02 15:04:05")

		opItem.ResponseContentType = c.Writer.Header().Get("Content-Type")
		if opItem.ResponseContentType=="application/json" {
			opItem.ResponseBody=writer.body.String()
		}

		opLog.WriteLog(&opItem)
		//fmt.Println("[Response]", status, writer.body.String())
	}
}