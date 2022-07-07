package common

import (
    "github.com/gin-gonic/gin"
    "time"
	"log"
	"strings"
	"net/http"
)

type repHeader struct {
	Token     string  `json:"token"`
}

func AuthMiddleware(loginCache LoginCache,appCache AppCache) gin.HandlerFunc {
	return func(c *gin.Context) {
		t := time.Now()
		log.Print("AuthMiddleware start")
		log.Print(c.Request.URL.Path)
		errorCode:=ResultSuccess
		// Set example variable
		if strings.Index(c.Request.URL.Path,"/appimages/") ==0 ||
		   strings.Index(c.Request.URL.Path,"/appI18n/") ==0 {
			params:=strings.Split(c.Request.URL.Path,"/")
			if len(params)>2 {
				appID:=params[2]
				appDB,_:=appCache.GetAppDB(appID)
				c.Set("appDB",appDB)
			}
		} else if strings.Compare(c.Request.URL.Path,"/user/login") !=0 {
			var header repHeader
			if err := c.ShouldBindHeader(&header); err != nil {
				log.Println(err)
				errorCode=ResultWrongRequest
			} else {
				userID,err:=loginCache.GetUserID(header.Token)
				if err != nil {
					log.Println(err)
					errorCode=ResultTokenExpired
				} else {
					appDB,err:=loginCache.GetAppDB(header.Token)
					if err != nil {
						log.Println(err)
						errorCode=ResultTokenExpired
					} else {
						userRoles,err:=loginCache.GetUserRoles(header.Token)
						if err != nil {
							log.Println(err)
							errorCode=ResultTokenExpired
						} else {
							//重新设置token是为了更新token的过期时间
							loginCache.SetCache(userID,header.Token,appDB,userRoles)
							c.Set("userID",userID)
							c.Set("appDB",appDB)
							c.Set("userRoles",userRoles)
						}
					}
				}
			}
		}
		// before request
		if errorCode == ResultSuccess {
			log.Print("into next")
			c.Next()
		} else {
			c.Abort()
			rsp:=CreateResponse(errorCode,nil)
			c.IndentedJSON(http.StatusOK, rsp.Rsp)
		}
		// after request
		latency := time.Since(t)
		log.Print(latency)

		// access the status we are sending
		status := c.Writer.Status()
		log.Println(status)

		log.Print("AuthMiddleware end")
	}
}