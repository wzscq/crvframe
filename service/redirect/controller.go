package redirect

import (
	"bytes"
	"crv/frame/common"
	"crv/frame/definition"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"io"
	"io/ioutil"
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
)

//"encoding/json" "bytes" "io/ioutil"

type commonRep struct {
	ModelID    string                    `json:"modelID"`
	ViewID     *string                   `json:"viewID"`
	To         *string                   `json:"to"`
	FilterData *[]map[string]interface{} `json:"filterData"`
	Filter     *map[string]interface{}   `json:"filter"`
	List       *[]map[string]interface{} `json:"list"`
	UserID     string                    `json:"userID"`
	AppDB      string                    `json:"appDB"`
	UserToken  string                    `json:"userToken"`
	UserRoles  string                    `json:"userRoles"`
	FlowID     string                    `json:"flowID"`
	//Fields *[]field `json:"fields"`
	//Sorter *[]sorter `json:"sorter"`
	SelectedRowKeys *[]string `json:"selectedRowKeys"`
	//Pagination *pagination `json:"pagination"`
}

type repHeader struct {
	Token string `json:"token"`
}

type RedirectController struct {
}

func removeMultiCrosHeader(r *http.Response) error {
	r.Header.Del("Access-Control-Allow-Credentials")
	r.Header.Del("Access-Control-Allow-Origin")
	return nil
}

func (controller *RedirectController) redirect(c *gin.Context) {
	slog.Debug("start redirect ")

	userID := c.MustGet("userID").(string)
	userRoles := c.MustGet("userRoles").(string)
	appDB := c.MustGet("appDB").(string)
	token := c.MustGet("userToken").(string)

	bodyCopy := new(bytes.Buffer)
	_, err := io.Copy(bodyCopy, c.Request.Body)
	if err != nil {
		rsp := common.CreateResponse(common.CreateError(common.ResultWrongRequest, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end redirect with error", "error", err)
		return
	}

	bodyData := bodyCopy.Bytes()
	c.Request.Body = ioutil.NopCloser(bytes.NewReader(bodyData))

	var rep commonRep
	if err := c.ShouldBindBodyWith(&rep, binding.JSON); err != nil {
		rsp := common.CreateResponse(common.CreateError(common.ResultWrongRequest, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end redirect with error", "error", err)
		return
	}

	c.Request.Body = ioutil.NopCloser(bytes.NewReader(bodyData))

	if rep.To == nil {
		rsp := common.CreateResponse(common.CreateError(common.ResultNoExternalApiId, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end redirect with error", "errorCode", common.ResultNoExternalApiId, "message", rsp.Message)
		return
	}

	//get url
	postUrl, errorCode := definition.GetApiUrl(appDB, *rep.To,userRoles)
	if errorCode != common.ResultSuccess {
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end redirect with error", "errorCode", errorCode, "message", rsp.Message)
		return
	}

	//
	remote, err := url.Parse(postUrl)
	if err != nil {
		rsp := common.CreateResponse(common.CreateError(common.ResultReadExternalApiResultError, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end redirect with error", "error", err)
		return
	}

	proxy := httputil.NewSingleHostReverseProxy(remote)
	
	proxy.Director = func(req *http.Request) {
		req.Header = c.Request.Header
		req.Header.Set("userID", userID)
		req.Header.Set("appDB", appDB)
		req.Header.Set("userRoles", userRoles)
		req.Header.Set("token", token)

		req.Host = remote.Host
		req.URL.Scheme = remote.Scheme
		req.URL.Host = remote.Host
		req.URL.Path = remote.Path
	}

	proxy.ModifyResponse = removeMultiCrosHeader

	proxy.ServeHTTP(c.Writer, c.Request)

	return
}

func (controller *RedirectController) Bind(router *gin.Engine) {
	slog.Info("Bind RedirectController")
	router.POST("/redirect", controller.redirect)
}
