package flow

import (
	"crv/frame/data"
)

const (
	NODE_START = "start"
	NODE_FORM = "form"
	NODE_SAVE = "save"
	NODE_END = "end"
)

type nodeExecutor interface {
	run(instance *flowInstance,node *instanceNode,req *flowReqRsp,userID,userRoles string)(*flowReqRsp,int)
}

func getExecutor(node *node,dataRepo data.DataRepository)(nodeExecutor){
	if node.Type ==NODE_START {
		return &nodeExecutorStart{}
	} else if node.Type == NODE_FORM {
		return &nodeExecutorForm{}
	} else if node.Type == NODE_SAVE {
		return &nodeExecutorSave{
			DataRepository:dataRepo,
		}
	} else if node.Type == NODE_END {
		return &nodeExecutorEnd{}
	}
	return nil
}