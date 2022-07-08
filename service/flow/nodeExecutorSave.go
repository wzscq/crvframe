package flow

import (
    "time"
	"crv/frame/common"
	"crv/frame/data"
)

type nodeExecutorSave struct {
	DataRepository data.DataRepository
}

func (nodeExecutor *nodeExecutorSave)run(
	instance *flowInstance,
	node *instanceNode,
	req *flowRepRsp,
	userID,userRoles string)(*flowRepRsp,int){

	save:=&data.Save{
		ModelID:*req.ModelID,
		AppDB:instance.AppDB,
		UserID:userID,
		List:req.List,
		UserRoles:userRoles,
	}
	result,errorCode:=save.Execute(nodeExecutor.DataRepository)
	
	flowResult:=&flowRepRsp{
		ModelID:&result.ModelID,
		Total:&result.Total,
		List:&result.List,
	}

	if errorCode!=common.ResultSuccess {
		return flowResult,errorCode
	}

	endTime:=time.Now().Format("2006-01-02 15:04:05")
	node.Completed=true
	node.EndTime=&endTime
	node.Data=[]interface{}{
		map[string]interface{}{
			"input":req,
			"output":flowResult,
		},
	}
	node.UserID=userID
	return flowResult,common.ResultSuccess
}