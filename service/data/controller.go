package data

import (
	"log/slog"
	"github.com/gin-gonic/gin"
	"crv/frame/common"
	"net/http"
	"os"
	"io"
)

type FilterDataItem struct {
	ModelID string `json:"modelID"`
	Filter *map[string]interface{} `json:"filter"`
	Fields *[]Field `json:"fields"`
}

type CommonReq struct {
	ModelID string `json:"modelID"`
	ViewID *string `json:"viewID"`
	FilterData *[]FilterDataItem `json:"filterData"`
	Filter *map[string]interface{} `json:"filter"`
	List *[]map[string]interface{} `json:"list"`
	Fields *[]Field `json:"fields"`
	Sorter *[]Sorter `json:"sorter"`
	SelectedRowKeys *[]string `json:"selectedRowKeys"`
	Pagination *Pagination `json:"pagination"`
	SelectAll bool `json:"selectAll"`
}

type DataController struct {
	DataRepository DataRepository
}

func (controller *DataController) query(c *gin.Context) {
	slog.Debug("start data query")
	//获取用户账号
	userRoles:= c.MustGet("userRoles").(string)
	userID:= c.MustGet("userID").(string)
	appDB:= c.MustGet("appDB").(string)
	var rep CommonReq
	var errorCode int
	var result *QueryResult
	if err := c.BindJSON(&rep); err != nil {
		slog.Error(err.Error())
		errorCode=common.ResultWrongRequest
    } else {
		errorCode=processFilter(rep.Filter,rep.FilterData,userID,userRoles,appDB,controller.DataRepository)
		if errorCode==common.ResultSuccess {
			//ReplaceArrayValue(rep.Filter,rep.Fields)
			query:=&Query{
				ModelID:rep.ModelID,
				ViewID:rep.ViewID,
				Pagination:rep.Pagination,
				Filter:rep.Filter,
				Fields:rep.Fields,
				AppDB:appDB,
				Sorter:rep.Sorter,
				UserRoles:userRoles,
			}
			result,errorCode=query.Execute(controller.DataRepository,true)
		}
	}
	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end data query")
}

func (controller *DataController) save(c *gin.Context) {
	slog.Debug("start data save")
	//获取用户账号
	userRoles:= c.MustGet("userRoles").(string)
	userID:= c.MustGet("userID").(string)
	appDB:= c.MustGet("appDB").(string)
	var rep CommonReq
	var errorCode int
	var result *saveResult
	if err := c.BindJSON(&rep); err != nil {
		slog.Error(err.Error())
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data save with error")
		return
  }
		
	if rep.List==nil{
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data save with error")
		return
	}

	save:=&Save{
		ModelID:rep.ModelID,
		AppDB:appDB,
		UserID:userID,
		List:rep.List,
		UserRoles:userRoles,
	}
	result,errorCode=save.Execute(controller.DataRepository)
	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end data save success")
}

func (controller *DataController) delete(c *gin.Context) {
	slog.Debug("start data delete")
	//获取用户账号
	userID:= c.MustGet("userID").(string)
	userRoles:= c.MustGet("userRoles").(string)
	appDB:= c.MustGet("appDB").(string)
	var rep CommonReq
	var errorCode int
	var result *map[string]interface {} = nil
	if err := c.BindJSON(&rep); err != nil {
		slog.Error(err.Error())
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data delete with error")
		return
  }

	if rep.SelectedRowKeys == nil {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data delete with error")
		return
	}

	delete:=&Delete{
		ModelID:rep.ModelID,
		AppDB:appDB,
		UserID:userID,
		SelectedRowKeys:rep.SelectedRowKeys,
		UserRoles:userRoles,
	}
	result,errorCode=delete.Execute(controller.DataRepository)
	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end data delete")
}

func (controller *DataController) update(c *gin.Context) {
	slog.Debug("start data update")
	//获取用户账号
	userID:= c.MustGet("userID").(string)
	userRoles:= c.MustGet("userRoles").(string)
	appDB:= c.MustGet("appDB").(string)
	var rep CommonReq
	var errorCode int
	var result *map[string]interface {} = nil
	if err := c.BindJSON(&rep); err != nil {
		slog.Error(err.Error())
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data update with error")
		return
  }

	if (rep.SelectedRowKeys == nil || len(*rep.SelectedRowKeys)==0) && rep.SelectAll==false {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data update with error")
		return
	}

	errorCode=processFilter(rep.Filter,rep.FilterData,userID,userRoles,appDB,controller.DataRepository)
	if errorCode==common.ResultSuccess {
		update:=&Update{
			ModelID:rep.ModelID,
			ViewID:rep.ViewID,
			AppDB:appDB,
			UserID:userID,
			SelectedRowKeys:rep.SelectedRowKeys,
			UserRoles:userRoles,
			List:rep.List,
			Filter:rep.Filter,
			Fields:rep.Fields,
		}
		result,errorCode=update.Execute(controller.DataRepository)
	}
	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
	c.IndentedJSON(http.StatusOK, rsp)
	slog.Debug("end data update")
}

func (controller *DataController)download(c *gin.Context) {
	slog.Debug("start data download")
	//获取用户账号
	userID:= c.MustGet("userID").(string)
	appDB:= c.MustGet("appDB").(string)
	var rep CommonReq
	var errorCode int
	var result *map[string]interface {} = nil
	if err := c.BindJSON(&rep); err != nil {
		slog.Error(err.Error())
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
		c.IndentedJSON(http.StatusInternalServerError, rsp)
		slog.Debug("end data download with error")
		return
    }

	if rep.List == nil || len(*(rep.List))<=0 {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
		c.IndentedJSON(http.StatusInternalServerError, rsp)
		slog.Debug("end data download with error")
		return
	}

	download:=&Download{
		ModelID:rep.ModelID,
		AppDB:appDB,
		UserID:userID,
		List:rep.List,
	}

	errorCode=download.Execute(c)
	if errorCode!=common.ResultSuccess {
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
		c.IndentedJSON(http.StatusInternalServerError, rsp)
	}
	slog.Debug("end data download")
}

func (controller *DataController)getImage(c *gin.Context) {
	slog.Debug("start data getImage")
	//获取用户账号
	userID:= c.MustGet("userID").(string)
	appDB:= c.MustGet("appDB").(string)
	var rep CommonReq
	var errorCode int
	
	if err := c.BindJSON(&rep); err != nil {
		slog.Error(err.Error())
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data getImage with error")
		return
  }

	if rep.List == nil || len(*(rep.List))<=0 {
		errorCode=common.ResultWrongRequest
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),nil)
		c.IndentedJSON(http.StatusOK, rsp)
		slog.Debug("end data getImage with error")
		return
	}

	imageFile:=&ImageFile{
		ModelID:rep.ModelID,
		AppDB:appDB,
		UserID:userID,
		List:rep.List,
	}

	result,errorCode:=imageFile.getImages()
	rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
	c.IndentedJSON(http.StatusOK, rsp)
	
	slog.Debug("end getImage download")
}

func (controller *DataController)upload(c *gin.Context) {


	f, uploadedFile, err := c.Request.FormFile("file")
	if err != nil {
			slog.Error("uplaod file error","error",err)
			c.IndentedJSON(http.StatusInternalServerError, nil)
			return
	} 

	slog.Info("upload file","name",uploadedFile.Filename,"size",uploadedFile.Size,"header",uploadedFile.Header)
						
	out, err := os.Create(uploadedFile.Filename)
	if err != nil {
		slog.Error("uplaod file error","error",err)
		c.IndentedJSON(http.StatusInternalServerError, nil)
		return
	}
	defer out.Close()
		
	_, err = io.Copy(out, f)
	if err != nil {
		slog.Error("uplaod file error","error",err)
		c.IndentedJSON(http.StatusInternalServerError, nil)
		return
	}
		
	c.String(http.StatusCreated, "file uploaded successfully")
}

func (controller *DataController) Bind(router *gin.Engine) {
	slog.Debug("Bind DataController")
	router.POST("/data/query", controller.query)
	router.POST("/data/save", controller.save)
	router.POST("/data/delete", controller.delete)
	router.POST("/data/update", controller.update)
	router.POST("/data/download", controller.download)
	router.POST("/data/getImage", controller.getImage)
	router.POST("/data/upload", controller.upload)
}