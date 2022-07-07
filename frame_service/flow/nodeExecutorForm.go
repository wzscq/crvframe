package flow

import (
    "time"
	"crv/frame/common"
)

type nodeExecutorForm struct {

}

func (nodeExecutor *nodeExecutorForm)runStage0(
	instance *flowInstance,
	node *instanceNode,
	req *flowRepRsp,
	userID string)(*flowRepRsp,int){
	
	stage:=1
	operation:=map[string]interface{}{
		"id":"create", 
        "name":map[string]interface{}{
                "default":"创建",
                "zh_CN":"创建",
                "en_US":"Create",
        }, 
        "type":"open",
        "params":map[string]interface{}{
                    "url":"/crv_form_view/#/lms_student/addStudentFlowForm/create",
                    "location":"modal",
                    "title":"增加学生",
                    "key":"/model/lms_student/addStudentFlowForm/create",
                    "width":800,
                    "height":600,
        },
        "input":map[string]interface{}{
			"flowInstanceID":&(instance.InstanceID),
			"stage":&stage,
		},
        "description":"打开增加学生对话框",
	}
	
	result:=&flowRepRsp{
		Operation:&operation,
	}

	node.Data=[]interface{}{
		map[string]interface{}{
			"stage0":map[string]interface{}{
				"input":req,
				"output":result,
				"userID":userID,
			},
		},
	}
	node.UserID=userID
	return result,common.ResultSuccess
}

func (nodeExecutor *nodeExecutorForm)runStage1(
	instance *flowInstance,
	node *instanceNode,
	req *flowRepRsp,
	userID string)(*flowRepRsp,int){
	
	endTime:=time.Now().Format("2006-01-02 15:04:05")
	node.Completed=true
	node.EndTime=&endTime
	node.UserID=userID
	
	stage1Data:=map[string]interface{}{
		"stage1":map[string]interface{}{
			"input":req,
			"output":req,
			"userID":userID,
		},
	}
	
	node.Data=append(node.Data,stage1Data)
	node.UserID=userID
	return req,common.ResultSuccess
}

func (nodeExecutor *nodeExecutorForm)run(
	instance *flowInstance,
	node *instanceNode,
	req *flowRepRsp,
	userID string)(*flowRepRsp,int){

	if req.Stage==nil || *(req.Stage) == 0 {
		return nodeExecutor.runStage0(instance,node,req,userID)
	}

	return nodeExecutor.runStage1(instance,node,req,userID)
}