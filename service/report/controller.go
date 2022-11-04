package report

import (
	"log"
	"github.com/gin-gonic/gin"
	"crv/frame/common"
	"crv/frame/definition"
	"crv/frame/data"
	"net/http"
)

type ReportReq struct {
	ReportID string `json:"reportID"`
	ControlID string `json:"controlID"`
}

type reportResult struct {
	ReportID string `json:"reportID"`
	ControlID string `json:"controlID"`
	List []map[string]interface{} `json:"list"`
}

type ReportController struct {
	DataRepository data.DataRepository
}

func (controller *ReportController) query(c *gin.Context) {
	log.Println("start report query")
	var req ReportReq
	if err := c.BindJSON(&req); err != nil {
		log.Println(err)
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end report query with error")
		return
    }

	//userID:= c.MustGet("userID").(string)
	appDB:= c.MustGet("appDB").(string)
	//获取报表控件对应的查询语句
	sql,err:=definition.GetReportQuery(appDB,req.ReportID,req.ControlID)
	if err!=nil {
		rsp:=common.CreateResponse(err,nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end report query with error")
		return
	}

	//执行查询获取数据
	res,sqlErr:=controller.DataRepository.Query(sql)
	if sqlErr!=nil {
		params:=map[string]interface{}{
			"sqlErr":sqlErr.Error(),
		}
		rsp:=common.CreateResponse(common.CreateError(common.ResultSQLError,params),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end report query with error")
		return
	}

	result:=&reportResult{
		ReportID:req.ReportID,
		ControlID:req.ControlID,
		List:res,
	}
	
	rsp:=common.CreateResponse(nil,result)
	c.IndentedJSON(http.StatusOK, rsp)
	log.Println("end report query")
}

func (controller *ReportController) Bind(router *gin.Engine) {
	log.Println("Bind ReportController")
	router.POST("/report/query", controller.query)
}