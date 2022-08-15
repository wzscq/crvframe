package flow

import (
	"crv/frame/data"
	"crv/frame/common"
)

const (
	NODE_START = "start"
	NODE_FORM = "form"
	NODE_SAVE = "save"
	NODE_END = "end"
	NODE_MERGE = "merge"
	NODE_REQUEST = "request"
)

type nodeExecutor interface {
	run(instance *flowInstance,node *instanceNode,req *flowReqRsp,userID,userRoles string)(*flowReqRsp,*common.CommonError)
}

func getExecutor(node *node,dataRepo data.DataRepository)(nodeExecutor){
	if node.Type ==NODE_START {
		return &nodeExecutorStart{}
	} else if node.Type == NODE_FORM {
		return &nodeExecutorForm{
			NodeConf:node,
		}
	} else if node.Type == NODE_SAVE {
		return &nodeExecutorSave{
			DataRepository:dataRepo,
		}
	} else if node.Type == NODE_END {
		return &nodeExecutorEnd{}
	} else if node.Type == NODE_MERGE {
		return &nodeExecutorMerge{
			NodeConf:node,
		}
	} else if node.Type == NODE_REQUEST {
		return &nodeExecutorRequest{
			NodeConf:node,
		}
	}
	return nil
}