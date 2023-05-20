package flow

import (
	"log"
	"github.com/gin-gonic/gin"
	"crv/frame/common"
	"crv/frame/data"
	"net/http"
)

//流中的请求和应答采用相同的结构，便于不同节点间传递数据
type flowReqRsp struct {
	ModelID *string `json:"modelID,omitempty"`
	ViewID *string `json:"viewID,omitempty"`
	Filter *map[string]interface{} `json:"filter,omitempty"`
	List *[]map[string]interface{} `json:"list,omitempty"`
	Fields *interface{} `json:"fields,omitempty"`
	Sorter *interface{} `json:"sorter,omitempty"`
	SelectedRowKeys *[]string `json:"selectedRowKeys,omitempty"`
	Pagination *interface{} `json:"pagination,omitempty"`
	FlowID *string `json:"flowID,omitempty"`
	FlowInstanceID *string `json:"flowInstanceID,omitempty"`
	Stage *int `json:"stage,omitempty"`
	Total *int `json:"total,omitempty"`
	Operation *map[string]interface{} `json:"operation,omitempty"`
	Value *string `json:"value,omitempty"`
}

type FlowController struct {
	InstanceRepository FlowInstanceRepository
	DataRepository data.DataRepository
}

type repHeader struct {
	Token     string  `json:"token"`
}

func (controller *FlowController)start(c *gin.Context){
	log.Println("start FlowController start")
	//获取相关参数
	userRoles:= c.MustGet("userRoles").(string)
	userID:= c.MustGet("userID").(string)
	appDB:= c.MustGet("appDB").(string)
	token:=c.MustGet("userToken").(string)

	var result *flowReqRsp
	var header repHeader
	if err := c.ShouldBindHeader(&header); err != nil {
		log.Println(err)
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end FlowController start")
		return
	}

	var rep flowReqRsp
	if err := c.BindJSON(&rep); err != nil {
		log.Println(err)
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end FlowController start")
		return
	} 

	//启动流必须指定流的ID
	if rep.FlowID == nil || len(*(rep.FlowID))==0 {
		rsp:=common.CreateResponse(common.CreateError(common.ResultStartFlowWithoutID,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end FlowController start")
		return
	}

	//创建流
	flowInstance,errorCode:=createInstance(appDB,*(rep.FlowID),userID)
	if errorCode!=common.ResultSuccess {
		rsp:=common.CreateResponse(common.CreateError(errorCode,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end FlowController start")
		return
	}
	log.Println("userToken:",token)
	//执行流
	result,err:=flowInstance.push(controller.DataRepository,&rep,userID,userRoles,token)

	//如果流中存在待执行的节点，则保存流实例到缓存
	if !flowInstance.Completed {
		err:=controller.InstanceRepository.saveInstance(flowInstance)
		if err!=nil {
			rsp:=common.CreateResponse(common.CreateError(common.ResultCacheFlowInstanceError,nil),result)
			c.IndentedJSON(http.StatusOK, rsp)
			log.Println("end FlowController start")
			return
		}
	}
	
	rsp:=common.CreateResponse(err,result)
	c.IndentedJSON(http.StatusOK, rsp)
	log.Println("end FlowController start")
}

func (controller *FlowController)terminate(c *gin.Context){

}

func (controller *FlowController)push(c *gin.Context){
	log.Println("start FlowController push")
	//继续一个流的执行，这种情况一般时流的执行需要人为干预，填写一些数据
	//也可以时流执行导某个步骤失败后，人工维护了数据后继续执行
	//要推动一个流，需要至少提供一个流实例的ID，对于某些节点还需要提供stage
	userRoles:= c.MustGet("userRoles").(string)
	userID:= c.MustGet("userID").(string)
	token:=c.MustGet("userToken").(string)

	log.Println("userToken:",token)
	//appDB:= c.MustGet("appDB").(string)
	var result *flowReqRsp
	var header repHeader
	if err := c.ShouldBindHeader(&header); err != nil {
		log.Println(err)
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end FlowController start")
		return
	}

	var rep flowReqRsp
	if err := c.BindJSON(&rep); err != nil {
		log.Println(err)
		rsp:=common.CreateResponse(common.CreateError(common.ResultWrongRequest,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end FlowController push")
		return
	} 

	//PUSH流必须指定流的instanceID
	if rep.FlowInstanceID == nil || len(*(rep.FlowInstanceID))==0 {
		rsp:=common.CreateResponse(common.CreateError(common.ResultPushFlowWithoutID,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end FlowController push")
		return
	}	

	//加载流实例
	flowInstance,err:=controller.InstanceRepository.getInstance(*(rep.FlowInstanceID))
	if err!=nil {
		rsp:=common.CreateResponse(common.CreateError(common.ResultLoadFlowInstanceError,nil),result)
		c.IndentedJSON(http.StatusOK, rsp)
		log.Println("end FlowController push")
		return
	}

	//执行流
	result,commonErr:=flowInstance.push(controller.DataRepository,&rep,userID,userRoles,token)

	//如果流中存在待执行的节点，则保存流实例到缓存
	if !flowInstance.Completed {
		err:=controller.InstanceRepository.saveInstance(flowInstance)
		if err!=nil {
			rsp:=common.CreateResponse(common.CreateError(common.ResultCacheFlowInstanceError,nil),result)
			c.IndentedJSON(http.StatusOK, rsp)
			log.Println("end FlowController push")
			return
		}
	}
	
	rsp:=common.CreateResponse(commonErr,result)
	c.IndentedJSON(http.StatusOK, rsp)
	log.Println("end FlowController push")
}

func (controller *FlowController) Bind(router *gin.Engine) {
	log.Println("Bind FlowController")
	router.POST("/flow/start", controller.start)
	router.POST("/flow/terminate", controller.terminate)
	router.POST("/flow/push", controller.push)
}