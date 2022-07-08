package flow

import (
    "time"
	"crv/frame/common"
)

type nodeExecutorStart struct {

}

func (nodeExecutor *nodeExecutorStart)run(
	instance *flowInstance,
	node *instanceNode,
	req *flowRepRsp,
	userID,userRoles string)(*flowRepRsp,int){
	
	endTime:=time.Now().Format("2006-01-02 15:04:05")
	node.Completed=true
	node.EndTime=&endTime
	node.Data=[]interface{}{req}
	node.UserID=userID
	return req,common.ResultSuccess
}