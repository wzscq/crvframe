package data

import (
	"crv/frame/common"
	"github.com/gin-gonic/gin"
	"log/slog"
	"net/http"
	"net/url"
)

type FilterDataItem struct {
	ModelID string                  `json:"modelID"`
	Filter  *map[string]interface{} `json:"filter"`
	Fields  *[]Field                `json:"fields"`
}

type CommonReq struct {
	ModelID          string                    `json:"modelID"`
	ViewID           *string                   `json:"viewID"`
	FilterData       *[]FilterDataItem         `json:"filterData"`
	GlobalFilterData *map[string]interface{}   `json:"globalFilterData"`
	Filter           *map[string]interface{}   `json:"filter"`
	List             *[]map[string]interface{} `json:"list"`
	Fields           *[]Field                  `json:"fields"`
	Sorter           *[]Sorter                 `json:"sorter"`
	SelectedRowKeys  *[]string                 `json:"selectedRowKeys"`
	Pagination       *Pagination               `json:"pagination"`
	SelectAll        bool                      `json:"selectedAll"`
}

type DataController struct {
	DataRepository  DataRepository
	UploadHandler   *UploadHandler
	DownloadHandler *DownloadHandler
}

func (controller *DataController) query(c *gin.Context) {
	slog.Debug("start data query")
	//获取用户账号
	userRoles := c.MustGet("userRoles").(string)
	userID := c.MustGet("userID").(string)
	appDB := c.MustGet("appDB").(string)
	var req CommonReq
	var errorCode int
	var result *QueryResult
	if err := c.BindJSON(&req); err != nil {
		slog.Error(err.Error())
		errorCode = common.ResultWrongRequest
	} else {
		errorCode = processFilter(
			req.Filter,
			req.FilterData,
			req.GlobalFilterData,
			userID,
			userRoles,
			appDB,
			controller.DataRepository)

		if errorCode == common.ResultSuccess {
			//ReplaceArrayValue(rep.Filter,rep.Fields)
			query := &Query{
				ModelID:    req.ModelID,
				ViewID:     req.ViewID,
				Pagination: req.Pagination,
				Filter:     req.Filter,
				Fields:     req.Fields,
				AppDB:      appDB,
				Sorter:     req.Sorter,
				UserRoles:  userRoles,
			}
			result, errorCode = query.Execute(controller.DataRepository, true)
		}
	}
	rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end data query")
}

func (controller *DataController) save(c *gin.Context) {
	slog.Debug("start data save")
	//获取用户账号
	userRoles := c.MustGet("userRoles").(string)
	userID := c.MustGet("userID").(string)
	appDB := c.MustGet("appDB").(string)
	var rep CommonReq
	var errorCode int
	var result *saveResult
	if err := c.BindJSON(&rep); err != nil {
		slog.Error(err.Error())
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data save with error")
		return
	}

	if rep.List == nil {
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data save with error")
		return
	}

	save := &Save{
		ModelID:   rep.ModelID,
		AppDB:     appDB,
		UserID:    userID,
		List:      rep.List,
		UserRoles: userRoles,
	}

	result, errorCode = save.Execute(controller.DataRepository)
	rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end data save success")
}

func (controller *DataController) delete(c *gin.Context) {
	slog.Debug("start data delete")
	//获取用户账号
	userID := c.MustGet("userID").(string)
	userRoles := c.MustGet("userRoles").(string)
	appDB := c.MustGet("appDB").(string)
	var rep CommonReq
	var errorCode int
	var result *map[string]interface{} = nil
	if err := c.BindJSON(&rep); err != nil {
		slog.Error(err.Error())
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data delete with error")
		return
	}

	if rep.SelectedRowKeys == nil {
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data delete with error")
		return
	}

	delete := &Delete{
		ModelID:         rep.ModelID,
		AppDB:           appDB,
		UserID:          userID,
		SelectedRowKeys: rep.SelectedRowKeys,
		UserRoles:       userRoles,
		Filter:          rep.Filter,
		SelectAll:       rep.SelectAll,
	}
	result, errorCode = delete.Execute(controller.DataRepository)
	rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end data delete")
}

func (controller *DataController) batchDelete(c *gin.Context) {
	slog.Debug("start data batchDelete")
	//获取用户账号
	userID := c.MustGet("userID").(string)
	userRoles := c.MustGet("userRoles").(string)
	appDB := c.MustGet("appDB").(string)
	var req CommonReq
	var errorCode int
	var result *map[string]interface{} = nil
	if err := c.BindJSON(&req); err != nil {
		slog.Error(err.Error())
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data batchDelete with error")
		return
	}

	if req.SelectedRowKeys == nil && req.SelectAll==false {
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data batchDelete with error")
		return
	}

	errorCode = processFilter(req.Filter, req.FilterData, req.GlobalFilterData, userID, userRoles, appDB, controller.DataRepository)
	if errorCode == common.ResultSuccess {
		delete := &BatchDelete{
			ModelID:         req.ModelID,
			AppDB:           appDB,
			UserID:          userID,
			SelectedRowKeys: req.SelectedRowKeys,
			UserRoles:       userRoles,
			Filter:          req.Filter,
			SelectAll:       req.SelectAll,
			Fields: 		 req.Fields,
		}
		result, errorCode = delete.Execute(controller.DataRepository)
	}
	rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end data batchDelete")
}

func (controller *DataController) update(c *gin.Context) {
	slog.Debug("start data update")
	//获取用户账号
	userID := c.MustGet("userID").(string)
	userRoles := c.MustGet("userRoles").(string)
	appDB := c.MustGet("appDB").(string)
	var req CommonReq
	var errorCode int
	var result *map[string]interface{} = nil
	if err := c.BindJSON(&req); err != nil {
		slog.Error(err.Error())
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data update with error")
		return
	}

	if (req.SelectedRowKeys == nil || len(*req.SelectedRowKeys) == 0) && req.SelectAll == false {
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data update with error")
		return
	}

	errorCode = processFilter(req.Filter, req.FilterData, req.GlobalFilterData, userID, userRoles, appDB, controller.DataRepository)
	if errorCode == common.ResultSuccess {
		update := &Update{
			ModelID:         req.ModelID,
			ViewID:          req.ViewID,
			AppDB:           appDB,
			UserID:          userID,
			SelectedRowKeys: req.SelectedRowKeys,
			UserRoles:       userRoles,
			List:            req.List,
			Filter:          req.Filter,
			Fields:          req.Fields,
		}
		result, errorCode = update.Execute(controller.DataRepository)
	}
	rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end data update")
}

func (controller *DataController) download(c *gin.Context) {
	slog.Debug("start data download")
	//获取用户账号
	//userID:= c.MustGet("userID").(string)
	//appDB:= c.MustGet("appDB").(string)
	var rep CommonReq
	if err := c.BindJSON(&rep); err != nil {
		slog.Error(err.Error())
		rsp := common.CreateResponse(common.CreateError(common.ResultWrongRequest, nil), nil)
		c.IndentedJSON(http.StatusInternalServerError, rsp)
		slog.Debug("end data download with error")
		return
	}

	if rep.List == nil || len(*(rep.List)) <= 0 {
		rsp := common.CreateResponse(common.CreateError(common.ResultWrongRequest, nil), nil)
		c.IndentedJSON(http.StatusInternalServerError, rsp)
		slog.Debug("end data download with error")
		return
	}

	name := (*(rep.List))[0]["name"].(string)
	path := (*(rep.List))[0]["path"].(string)
	fieldID := (*(rep.List))[0]["field_id"].(string)
	rowID := (*(rep.List))[0]["row_id"].(string)
	strID := (*(rep.List))[0]["id"].(string)

	c.Header("Content-Type", "application/octet-stream")
	fileName := url.QueryEscape(name)
	c.Header("Content-Disposition", "attachment;filename="+fileName)
	c.Header("Content-Transfer-Encoding", "binary")

	fileName = fieldID + "_row" + rowID + "_id" + strID + "_" + name
	c.File(path + fileName)
	slog.Debug("end data download")
}

func (controller *DataController) getImage(c *gin.Context) {
	slog.Debug("start data getImage")
	//获取用户账号
	userID := c.MustGet("userID").(string)
	appDB := c.MustGet("appDB").(string)
	var rep CommonReq
	var errorCode int

	if err := c.BindJSON(&rep); err != nil {
		slog.Error(err.Error())
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data getImage with error")
		return
	}

	if rep.List == nil || len(*(rep.List)) <= 0 {
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data getImage with error")
		return
	}

	imageFile := &ImageFile{
		ModelID: rep.ModelID,
		AppDB:   appDB,
		UserID:  userID,
		List:    rep.List,
	}

	result, errorCode := imageFile.getImages()
	rsp := common.CreateResponse(common.CreateError(errorCode, nil), result)
	c.IndentedJSON(http.StatusOK, rsp)

	slog.Debug("end getImage download")
}

func (controller *DataController) getUploadKey(c *gin.Context) {
	slog.Debug("start getUploadKey")
	//获取用户账号
	userID := c.MustGet("userID").(string)
	appDB := c.MustGet("appDB").(string)
	key, err := controller.UploadHandler.GetUploadKey(appDB, userID)
	if err != nil {
		slog.Error("getUploadKey error", "error", err)
		rsp := common.CreateResponse(common.CreateError(common.ResultGetUploadKeyError, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		return
	}

	result := make(map[string]interface{})
	result["key"] = key
	rsp := common.CreateResponse(common.CreateError(common.ResultSuccess, nil), result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end getUploadKey")
}

func (controller *DataController) upload(c *gin.Context) {
	key := c.PostForm("key")
	if len(key) == 0 {
		slog.Error("upload file error", "error", "key is empty")
		c.IndentedJSON(http.StatusInternalServerError, nil)
		return
	}

	uploadedFile, err := c.FormFile("file")
	if err != nil {
		slog.Error("uplaod file error", "error", err)
		c.IndentedJSON(http.StatusInternalServerError, nil)
		return
	}

	saveName, err := controller.UploadHandler.GetSaveFileName(key, uploadedFile.Filename)
	if err != nil {
		slog.Error("uplaod file error", "error", err)
		c.IndentedJSON(http.StatusInternalServerError, nil)
		return
	}

	slog.Info("upload file", "key", key, "saveName", saveName, "name", uploadedFile.Filename, "size", uploadedFile.Size, "header", uploadedFile.Header)

	c.SaveUploadedFile(uploadedFile, saveName)

	c.String(http.StatusCreated, "file uploaded successfully")
}

func (controller *DataController) getDownloadKey(c *gin.Context) {
	slog.Debug("start data getDownloadKey")
	//获取用户账号
	//userID:= c.MustGet("userID").(string)
	//appDB:= c.MustGet("appDB").(string)
	var rep CommonReq
	var errorCode int

	if err := c.BindJSON(&rep); err != nil {
		slog.Error(err.Error())
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), nil)
		c.IndentedJSON(http.StatusInternalServerError, rsp)
		slog.Debug("end data download with error")
		return
	}

	if rep.List == nil || len(*(rep.List)) <= 0 {
		errorCode = common.ResultWrongRequest
		rsp := common.CreateResponse(common.CreateError(errorCode, nil), nil)
		c.IndentedJSON(http.StatusInternalServerError, rsp)
		slog.Debug("end data download with error")
		return
	}

	name := (*(rep.List))[0]["name"].(string)
	path := (*(rep.List))[0]["path"].(string)
	fieldID := (*(rep.List))[0]["field_id"].(string)
	rowID := (*(rep.List))[0]["row_id"].(string)
	strID := (*(rep.List))[0]["id"].(string)

	fileName := fieldID + "_row" + rowID + "_id" + strID + "_" + name
	downloadKey, err := controller.DownloadHandler.GetDownloadKey(path+fileName, name)

	if err != nil {
		slog.Error("getDownlaodKey error", "error", err)
		rsp := common.CreateResponse(common.CreateError(common.ResultGetUploadKeyError, nil), nil)
		c.IndentedJSON(http.StatusOK, rsp)
		return
	}

	result := make(map[string]interface{})
	result["key"] = downloadKey
	rsp := common.CreateResponse(common.CreateError(common.ResultSuccess, nil), result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end getDownlaodKey")
}

func (controller *DataController) downloadByKey(c *gin.Context) {
	key := c.Param("key")
	if len(key) == 0 {
		slog.Error("downloadByKey error", "error", "key is empty")
		c.IndentedJSON(http.StatusInternalServerError, nil)
		return
	}

	fileName, orgName, err := controller.DownloadHandler.GetDownloadFileName(key)
	if err != nil {
		slog.Error("downloadByKey error", "error", err)
		c.IndentedJSON(http.StatusInternalServerError, nil)
		return
	}

	c.Header("Content-Disposition", "attachment;filename="+orgName)
	c.File(fileName)
}

func (controller *DataController) previewByKey(c *gin.Context) {
	key := c.Param("key")
	if len(key) == 0 {
		slog.Error("previewByKey error", "error", "key is empty")
		c.IndentedJSON(http.StatusInternalServerError, nil)
		return
	}

	fileName, orgName, err := controller.DownloadHandler.GetDownloadFileName(key)
	if err != nil {
		slog.Error("previewByKey error", "error", err)
		c.IndentedJSON(http.StatusInternalServerError, nil)
		return
	}

	c.Header("Content-Disposition", "inline; filename="+orgName)
	c.File(fileName)
}

func (controller *DataController) Bind(router *gin.Engine) {
	slog.Debug("Bind DataController")
	router.POST("/data/query", controller.query)
	router.POST("/data/save", controller.save)
	router.POST("/data/delete", controller.delete)
	router.POST("/data/batchDelete", controller.batchDelete)
	router.POST("/data/update", controller.update)
	router.POST("/data/download", controller.download)
	router.POST("/data/getImage", controller.getImage)
	router.POST("/data/upload", controller.upload)
	router.POST("/data/getUploadKey", controller.getUploadKey)
	router.POST("/data/getDownloadKey", controller.getDownloadKey)
	router.GET("/data/downloadByKey/:key", controller.downloadByKey)
	router.GET("/data/previewByKey/:key", controller.previewByKey)
}
