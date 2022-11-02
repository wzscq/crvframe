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
	req *flowReqRsp,
	userID,userRoles,userToken string)(*flowReqRsp,*common.CommonError){

	save:=&data.Save{
		ModelID:*req.ModelID,
		AppDB:instance.AppDB,
		UserID:userID,
		List:req.List,
		UserRoles:userRoles,
	}
	result,errorCode:=save.Execute(nodeExecutor.DataRepository)
	
	flowResult:=&flowReqRsp{
		ModelID:&result.ModelID,
		Total:&result.Total,
		List:&result.List,
	}

	if errorCode!=common.ResultSuccess {
		return flowResult,common.CreateError(errorCode,nil)
	}

	endTime:=time.Now().Format("2006-01-02 15:04:05")
	node.Completed=true
	node.EndTime=&endTime
	node.Data=map[string]interface{}{
			"output":flowResult,
		}
	node.UserID=userID
	return flowResult,nil
}