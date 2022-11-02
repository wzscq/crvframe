package flow

import (
    "time"
	"crv/frame/common"
)

type nodeExecutorEnd struct {

}

func (nodeExecutor *nodeExecutorEnd)run(
	instance *flowInstance,
	node *instanceNode,
	req *flowReqRsp,
	userID,userRoles,userToken string)(*flowReqRsp,*common.CommonError){
	
	endTime:=time.Now().Format("2006-01-02 15:04:05")
	node.Completed=true
	node.EndTime=&endTime
	node.Data=map[string]interface{}{
			"output":req,
		}
	node.UserID=userID
	return req,nil
}