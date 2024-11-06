package report

import (
	"crv/frame/common"
	"crv/frame/data"
	"crv/frame/definition"
	"github.com/gin-gonic/gin"
	"log/slog"
	"net/http"
	"time"
	"encoding/json"
)

type ReportReq struct {
	ReportID      string                  `json:"reportID"`
	ControlID     string                  `json:"controlID"`
	ParentID	  string                  `json:"parentID"`
	FilterData    *map[string]interface{} `json:"filterData,omitempty"`
	SQLParameters map[string]interface{}  `json:"sqlParameters"`
}

type reportResult struct {
	ReportID  string      `json:"reportID"`
	ControlID string      `json:"controlID"`
	List      interface{} `json:"list"`
}

type ReportController struct {
	DataRepository data.DataRepository
	ReportCache	ReportCache
}

func (controller *ReportController) query(c *gin.Context) {
	slog.Debug("start report query")
	var req ReportReq
	if err := c.BindJSON(&req); err != nil {
		rsp := common.CreateResponse(common.CreateError(common.ResultWrongRequest, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report query with error", "error", err)
		return
	}

	userToken := c.MustGet("userToken").(string)
	userRoles := c.MustGet("userRoles").(string)
	userID := c.MustGet("userID").(string)
	appDB := c.MustGet("appDB").(string)
	//获取报表控件对应的查询语句
	query, err := definition.GetReportQuery(appDB, req.ReportID, req.ControlID,req.ParentID)
	if err != nil {
		rsp := common.CreateResponse(err, nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report query with error", "error", err)
		return
	}

	res, commonErr := QueryData(appDB, userID, userRoles, userToken, query, req.FilterData, req.SQLParameters, controller.DataRepository)

	if commonErr != nil {
		rsp := common.CreateResponse(commonErr, nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report query with error", "error", commonErr)
		return
	}

	result := &reportResult{
		ReportID:  req.ReportID,
		ControlID: req.ControlID,
		List:      res,
	}

	rsp := common.CreateResponse(nil, result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end report query")
}

/*
Excel模板生成pdf，返回base64文件流
如何实现多行数据的扩展？
模板中允许扩展的页，sheet名后加上.x,允许扩展的单元格键名后加上.x
查询数据后，根据键名对数据进行扩展，构造对应的键名数据字典，键名后加上实际的行号作为键名
举例：
如果Excel单元格中配置了多个键名为name.x的单元格，查询结果数据中存在多行name字段，
则构造字典数据为：
{
	"name.1": "张三",
	"name.2": "李四",
	"name.3": "王五"
}
填充多个name.x单元格时，按照先从左到右,再从上到下的顺序填充，索引从1开始每次递增1，填完为止
如果填充完当前sheet页，还有未填充的数据行，且当前页sheet名称为sheetName.x，则在当前sheet后插入一个相同的sheet页，继续填充
如果最后一页有固定数据时，怎么处理？目前只支持填充固定数据
不去做自动伸缩
 */
func (controller *ReportController) getPdf(c *gin.Context) {
	slog.Debug("start report getPdf")
	var req ReportReq
	if err := c.BindJSON(&req); err != nil {
		rsp := common.CreateResponse(common.CreateError(common.ResultWrongRequest, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report getPdf with error", "error", err)
		return
	}

	userToken := c.MustGet("userToken").(string)
	userRoles := c.MustGet("userRoles").(string)
	userID := c.MustGet("userID").(string)
	appDB := c.MustGet("appDB").(string)
	//获取报表控件对应的查询语句
	query, err := definition.GetReportQuery(appDB, req.ReportID, req.ControlID,req.ParentID)
	if err != nil {
		rsp := common.CreateResponse(err, nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report getPdf with error", "error", err)
		return
	}

	res, commonErr := QueryCRVData(appDB, userID, userRoles, userToken, query, req.FilterData, req.SQLParameters, controller.DataRepository)

	if commonErr != nil {
		rsp := common.CreateResponse(commonErr, nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report getPdf with error", "error", commonErr)
		return
	}

	pdf,err1 := GetPDFReport(".",appDB, req.ReportID, req.ControlID, req.ParentID, res)
	if err1 != nil {
		params := map[string]interface{}{
			"error": err1.Error(),
		}
		rsp := common.CreateResponse(common.CreateError(common.ResultCreatePdfReportError, params), nil)
		c.IndentedJSON(http.StatusOK, rsp)
	}

	nowStr:=time.Now().Format("2006-01-02 15:04:05")
	fileName := req.ReportID+"_"+req.ControlID+"_"+nowStr+".pdf"
	c.Header("Content-Type", "application/octet-stream")
    c.Header("Content-Disposition", "attachment; filename="+fileName)
    c.Header("Content-Transfer-Encoding", "binary")

	pdf.Write(c.Writer)
	slog.Debug("end getPdf query")
}

func (controller *ReportController) getPdfKey(c *gin.Context) {
	slog.Debug("start report getPdfKey")
	var req ReportReq
	if err := c.BindJSON(&req); err != nil {
		rsp := common.CreateResponse(common.CreateError(common.ResultWrongRequest, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report getPdfKey with error", "error", err)
		return
	}

	userToken := c.MustGet("userToken").(string)
	userRoles := c.MustGet("userRoles").(string)
	userID := c.MustGet("userID").(string)
	appDB := c.MustGet("appDB").(string)
	
	//获取报表控件对应的查询语句
	query, commonErr := definition.GetReportQuery(appDB, req.ReportID, req.ControlID,req.ParentID)
	if commonErr != nil {
		rsp := common.CreateResponse(commonErr, nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report getPdf with error", "error", commonErr)
		return
	}

	res, commonErr := QueryCRVData(appDB, userID, userRoles, userToken, query, req.FilterData, req.SQLParameters, controller.DataRepository)

	if commonErr != nil {
		rsp := common.CreateResponse(commonErr, nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report getPdf with error", "error", commonErr)
		return
	}

	//将数据结果保存到缓存中
	reportKey:= req.ReportID+"_"+req.ControlID+"_"+GetPDFReportID()+".pdf"
	//使用json库将res转换为json字符串
	reportData,_:= json.Marshal(res)
	//req转换为json字符串
	reqStr, _:= json.Marshal(req)
	//保存缓存数据
	err:=controller.ReportCache.SaveReportKey(reportKey,string(reportData),string(reqStr))
	if err!=nil {
		params := map[string]interface{}{
			"error": err.Error(),
		}
		rsp := common.CreateResponse(common.CreateError(common.ResultSaveReportKeyError, params), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report getPdfKey with error", "error", err)
		return
	}

	result := &reportResult{
		ReportID:  req.ReportID,
		ControlID: req.ControlID,
		List:[]interface{}{
			map[string]interface{}{
				"key":appDB+"/"+reportKey,
			},
		},
	}

	rsp := common.CreateResponse(nil, result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end getPdf query")
}

func (controller *ReportController) getPdfByKey(c *gin.Context) {
	slog.Debug("start report getPdfByKey")
	key := c.Param("key")
	appDB := c.Param("appDB")
	if key == "" || appDB == "" {
		rsp := common.CreateResponse(common.CreateError(common.ResultWrongRequest, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report getPdfByKey with error", "error", "key is empty")
		return
	}

	reportData, err := controller.ReportCache.GetReportData(key)
	if err != nil {
		params := map[string]interface{}{
			"error": err.Error(),
		}
		rsp := common.CreateResponse(common.CreateError(common.ResultGetReportDataError, params), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report getPdfByKey with error", "error", err)
		return
	}

	res:=data.QueryResult{}
	err = json.Unmarshal([]byte(reportData), &res)
	if err != nil {
		params := map[string]interface{}{
			"error": err.Error(),
		}
		rsp := common.CreateResponse(common.CreateError(common.ResultGetReportDataError, params), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report getPdfByKey with error", "error", err)
		return
	}

	reqStr, err := controller.ReportCache.GetReportReq(key)
	if err != nil {
		params := map[string]interface{}{
			"error": err.Error(),
		}
		rsp := common.CreateResponse(common.CreateError(common.ResultGetReportDataError, params), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report getPdfByKey with error", "error", err)
		return
	}

	var req ReportReq
	err = json.Unmarshal([]byte(reqStr), &req)
	if err != nil {
		params := map[string]interface{}{
			"error": err.Error(),
		}
		rsp := common.CreateResponse(common.CreateError(common.ResultGetReportDataError, params), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Error("end report getPdfByKey with error", "error", err)
		return
	}

	pdf,err1 := GetPDFReport(".",appDB, req.ReportID, req.ControlID, req.ParentID, &res)
	if err1 != nil {
		params := map[string]interface{}{
			"error": err1.Error(),
		}
		rsp := common.CreateResponse(common.CreateError(common.ResultCreatePdfReportError, params), nil)
		c.IndentedJSON(http.StatusOK, rsp)
	}

	//c.Header("Content-Type", "application/pdf")
	//c.Header("Content-Disposition", "attachment; filename="+key)

	pdf.Write(c.Writer)
	slog.Debug("end getPdfByKey query")
}

func (controller *ReportController) Bind(router *gin.Engine) {
	slog.Info("Bind ReportController")
	router.POST("/report/query", controller.query)
	router.POST("/report/getPdf", controller.getPdf)
	router.POST("/report/getPdfKey", controller.getPdfKey)
	router.GET("/report/getPdfByKey/:appDB/:key", controller.getPdfByKey)
}
