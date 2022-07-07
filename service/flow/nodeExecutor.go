package flow

const (
	NODE_START = "start"
	NODE_FORM = "form"
	NODE_SAVE = "save"
	NODE_END = "end"
)

type nodeExecutor interface {
	run(instance *flowInstance,node *instanceNode,req *flowRepRsp,userID string)(*flowRepRsp,int)
}

func getExecutor(node *node)(nodeExecutor){
	if node.Type ==NODE_START {
		return &nodeExecutorStart{}
	} else if node.Type == NODE_FORM {
		return &nodeExecutorForm{}
	} else if node.Type == NODE_SAVE {
		return &nodeExecutorSave{}
	} else if node.Type == NODE_END {
		return &nodeExecutorEnd{}
	}
	return nil
}