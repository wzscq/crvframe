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
	req *flowRepRsp,
	userID string)(*flowRepRsp,int){
	
	endTime:=time.Now().Format("2006-01-02 15:04:05")
	node.Completed=true
	node.EndTime=&endTime
	node.Data=[]interface{}{req}
	node.UserID=userID
	return req,common.ResultSuccess
}