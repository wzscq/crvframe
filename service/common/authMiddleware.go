package common

import (
	"github.com/gin-gonic/gin"
	"log/slog"
	"net/http"
	"strings"
	"time"
)

type repHeader struct {
	Token string `json:"token"`
}

func AuthMiddleware(loginCache LoginCache, appCache AppCache) gin.HandlerFunc {
	return func(c *gin.Context) {
		t := time.Now()
		slog.Debug("AuthMiddleware start")
		slog.Debug(c.Request.URL.Path)
		errorCode := ResultSuccess
		// Set example variable
		if strings.Index(c.Request.URL.Path, "/cas/login/") == 0 {
			params := strings.Split(c.Request.URL.Path, "/")
			if len(params) > 3 {
				appID := params[3]
				appDB, _ := appCache.GetAppDB(appID)
				c.Set("appDB", appDB)
			}
		} else if strings.Index(c.Request.URL.Path, "/appimages/") == 0 ||
			strings.Index(c.Request.URL.Path, "/appI18n/") == 0 ||
			strings.Index(c.Request.URL.Path, "/data/upload") == 0 ||
			strings.Index(c.Request.URL.Path, "/data/downloadByKey") == 0 ||
			strings.Index(c.Request.URL.Path, "/data/previewByKey") == 0 {
			params := strings.Split(c.Request.URL.Path, "/")
			if len(params) > 2 {
				appID := params[2]
				appDB, _ := appCache.GetAppDB(appID)
				c.Set("appDB", appDB)
			}
		} else if strings.Compare(c.Request.URL.Path, "/user/login") != 0 &&
			strings.HasPrefix(c.Request.URL.Path, "/oauth/") == false {
			var header repHeader
			if err := c.ShouldBindHeader(&header); err != nil {
				slog.Error(err.Error())
				errorCode = ResultWrongRequest
			} else {
				userID, err := loginCache.GetUserID(header.Token)
				if err != nil {
					slog.Error(err.Error())
					token, paramSum := DecodeToken(header.Token)
					errorCode = CheckBody(c, paramSum)
					header.Token = token
					userID, err = loginCache.GetUserID(header.Token)
				}

				if err != nil {
					slog.Error(err.Error())
					errorCode = ResultTokenExpired
				} else {
					appDB, err := loginCache.GetAppDB(header.Token)
					if err != nil {
						slog.Error(err.Error())
						errorCode = ResultTokenExpired
					} else {
						userRoles, err := loginCache.GetUserRoles(header.Token)
						if err != nil {
							slog.Error(err.Error())
							errorCode = ResultTokenExpired
						} else {
							//重新设置token是为了更新token的过期时间
							ttl, _ := loginCache.GetTokenTTL(header.Token)
							if ttl.Nanoseconds() > 0 {
								loginCache.SetCache(userID, header.Token, appDB, userRoles)
							}
							c.Set("userID", userID)
							c.Set("appDB", appDB)
							c.Set("userRoles", userRoles)
							c.Set("userToken", header.Token)
						}
					}
				}
			}
		}
		// before request
		if errorCode == ResultSuccess {
			slog.Debug("into next")
			c.Next()
		} else {
			c.Abort()
			rsp := CreateResponse(CreateError(errorCode, nil), nil)
			c.IndentedJSON(http.StatusOK, rsp)
		}
		// after request
		latency := time.Since(t)
		slog.Debug("request response duration", "latency", latency)

		// access the status we are sending
		status := c.Writer.Status()
		slog.Debug("request response status", "status", status)

		slog.Debug("AuthMiddleware end")
	}
}
