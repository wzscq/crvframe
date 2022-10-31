package redirect

import (
	"log"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"crv/frame/common"
	"crv/frame/definition"
	"net/http"
	"net/http/httputil"
	"net/url"
	"bytes"
	"io"
	"io/ioutil"
)

//"encoding/json" "bytes" "io/ioutil"

type commonRep struct {
	ModelID string `json:"modelID"`
	ViewID *string `json:"viewID"`
	To *string `json:"to"`
	FilterData *[]map[string]interface{} `json:"filterData"`
	Filter *map[string]interface{} `json:"filter"`
	List *[]map[string]interface{} `json:"list"`
	UserID string `json:"userID"`
	AppDB string `json:"appDB"`
	UserToken string `json:"userToken"`
	UserRoles string `json:"userRoles"`
	FlowID string `json:"flowID"`
	//Fields *[]field `json:"fields"`
	//Sorter *[]sorter `json:"sorter"`
	SelectedRowKeys *[]string `json:"selectedRowKeys"`
	//Pagination *pagination `json:"pagination"`
}

type repHeader struct {
	Token     string  `json:"token"`
}

type RedirectController struct {
	 
}

func removeMultiCrosHeader(r *http.Response)(error){
	r.Header.Del("Access-Control-Allow-Credentials")
	r.Header.Del("Access-Control-Allow-Origin")
	return nil
}

func (controller *RedirectController)redirect(c *gin.Context){
	log.Println("start redirect ")

	userID:= c.MustGet("userID").(string)
	userRoles:= c.MustGet("userRoles").(string)
	appDB:= c.MustGet("appDB").(string)

	bodyCopy:=new(bytes.Buffer)
	_,err:=io.Copy(bodyCopy,c.Request.Body)
	if err != nil {
		log.Println(err)
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end redirect with error")
		return
	}

	bodyData:=bodyCopy.Bytes()
	c.Request.Body = ioutil.NopCloser(bytes.NewReader(bodyData))

	var rep commonRep
	if err := c.ShouldBindBodyWith(&rep,binding.JSON); err != nil {
		log.Println(err)
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end redirect with error")
		return
    }

	c.Request.Body = ioutil.NopCloser(bytes.NewReader(bodyData))
		
	if rep.To==nil{
		rsp:=common.CreateResponse(common.CreateError(common.ResultNoExternalApiId,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end redirect with error")
		return
	}

	//get url
	postUrl,errorCode:=definition.GetApiUrl(appDB,*rep.To)
	if errorCode != common.ResultSuccess {
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		return 
	}

	//
	remote, err := url.Parse(postUrl)
	if err != nil {
		panic(err)
	}

	proxy := httputil.NewSingleHostReverseProxy(remote)
	//Define the director func
	//This is a good place to log, for example
	proxy.Director = func(req *http.Request) {
		req.Header = c.Request.Header
		req.Header.Set("userID",userID)
		req.Header.Set("appDB",appDB)
		req.Header.Set("userRoles",userRoles)

		req.Host = remote.Host
		req.URL.Scheme = remote.Scheme
		req.URL.Host = remote.Host
		req.URL.Path = remote.Path
	}

	proxy.ModifyResponse=removeMultiCrosHeader

	proxy.ServeHTTP(c.Writer, c.Request)

	return
	/*rep.UserID=userID
	rep.AppDB=appDB
	rep.UserRoles=userRoles
	rep.UserToken=header.Token
	rep.To=nil
	postJson,_:=json.Marshal(rep)
	postBody:=bytes.NewBuffer(postJson)
	log.Println("http.Post ",postUrl,string(postJson))
	resp,err:=http.Post(postUrl,"application/json",postBody)

	if err != nil || resp==nil || resp.StatusCode != 200 { 
		log.Println(resp)
		rsp:=common.CreateResponse(common.CreateError(common.ResultPostExternalApiError,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		return 
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	log.Println("resp",string(body))
	//识别返回的类型，如果是二进制流，则直接转发到前端

	rsp:=&common.CommonRsp{}
    if err := json.Unmarshal(body, rsp); err != nil {
        log.Println(err)
    }

	//rsp:=common.CreateResponse(nil,nil)
	c.IndentedJSON(http.StatusOK, rsp)
	log.Println("end redirect success")*/
}

func (controller *RedirectController) Bind(router *gin.Engine) {
	log.Println("Bind RedirectController")
	router.POST("/redirect", controller.redirect)
}