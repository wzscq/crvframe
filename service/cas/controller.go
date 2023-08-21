package cas

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"gopkg.in/cas.v2"
)

type CasController struct {
	CasUrl string
}

func (controller *CasController)login(c *gin.Context) {
	appDB:= c.MustGet("appDB").(string)

	if !cas.IsAuthenticated(c.Request) {
		//重定向web到给定的回调地址
		url:=controller.CasUrl
		c.Redirect(http.StatusMovedPermanently, url)
		return
	}

	username := cas.Username(c.Request)
	
	//重定向web到给定的回调地址
	url:="/mainframe/#/caslogin/"+appDB+"/"+username
	c.Redirect(http.StatusMovedPermanently, url)
}

func (controller *CasController) Bind(router *gin.Engine) {
	log.Println("Bind CasController")
	router.POST("/cas/login/:appID", controller.login)
}