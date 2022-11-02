package flow

import (
	"log"
	"crv/frame/common"
	"crv/frame/data"
)

type flowInstance struct {
	 AppDB string `json:"appDB"`
	 FlowID string `json:"flowID"`
	 InstanceID string `json:"instanceID"`
	 UserID string  `json:"UserID"`
	 FlowConf *flowConf `json:"flowConf,omitempty"`
	 Nodes []instanceNode `json:"nodes"`
	 Completed bool `json:"completed"`
	 StartTime string `json:"startTime"`
	 EndTime *string `json:"endTime,omitempty"`
}

func (flow *flowInstance)getCurrentNode()(*instanceNode){
	nodeCount:=len(flow.Nodes)
	if nodeCount>0 {
		return &(flow.Nodes[nodeCount-1])
	}
	return nil
}

func (flow *flowInstance)getStartNode()(*instanceNode){
	for _, nodeItem := range (flow.FlowConf.Nodes) {
		if nodeItem.Type == NODE_START {
			return createInstanceNode(nodeItem.ID)
		}
	}
	return nil
}

func (flow *flowInstance)getNextNode(currentNode *instanceNode)(*instanceNode){
	for _, edgeItem := range (flow.FlowConf.Edges) {
		if edgeItem.Source == currentNode.ID {
			return createInstanceNode(edgeItem.Target)
		}
	}
	return nil
}

func (flow *flowInstance)addInstanceNode(node *instanceNode){
	flow.Nodes=append(flow.Nodes,*node)
}

func (flow *flowInstance)updateCurrentNode(node *instanceNode){
	nodeCount:=len(flow.Nodes)
	flow.Nodes[nodeCount-1]=*node
}

func (flow *flowInstance)getNodeConfig(id string)(node *node){
	for _, nodeItem := range (flow.FlowConf.Nodes) {
		if nodeItem.ID == id {
			return &nodeItem
		}
	}
	return nil
}

func (flow *flowInstance)runNode(dataRepo data.DataRepository,node *instanceNode,req *flowReqRsp,userID,userRoles,userToken string)(*flowReqRsp,*common.CommonError){
	//根据节点类型，找到对应的节点，然后执行节点
	nodeCfg:=flow.getNodeConfig(node.ID)
	if nodeCfg==nil {
		log.Println("can not find the node config with id: ",node.ID)		
		return nil,common.CreateError(common.ResultNoNodeOfGivenID,nil)
	}
	executor:=getExecutor(nodeCfg,dataRepo)
	if executor==nil {
		log.Println("can not find the node executor with type: ",nodeCfg.Type)
		return nil,common.CreateError(common.ResultNoExecutorForNodeType,nil)
	}
	return executor.run(flow,node,req,userID,userRoles,userToken)
}

func (flow *flowInstance)push(dataRepo data.DataRepository,flowRep* flowReqRsp,userID,userRoles,userToken string)(*flowReqRsp,*common.CommonError){
	log.Println("start flowInstance push")
	//每个节点的执行都包含两个步骤，启动和结束，
	//先判断当前正在执行的节点（ExecutedNodes中最后一个节点）是否存在，如果存在则加载这个节点并运行
	//如果ExecutedNodes中没有节点，则从FlowConf中获取第一个节点（一般都应该是start节点）加载运行
	//如果当前正在执行的节点执行完成，则从FlowConf中获取下一个待执行节点
	currentNode:=flow.getCurrentNode()
	if currentNode==nil {
		currentNode=flow.getStartNode()
		flow.addInstanceNode(currentNode)
	}

	//循环执行所有同步的node
	for currentNode!=nil {
		result,err:=flow.runNode(dataRepo,currentNode,flowRep,userID,userRoles,userToken)
		if err!= nil {
			return nil,err
		}
		//更新节点状态
		flow.updateCurrentNode(currentNode)
		//如果执行完，就拿下一个节点继续执行
		if currentNode.Completed {
			currentNode=flow.getNextNode(currentNode)
			if currentNode !=nil {
				flow.addInstanceNode(currentNode)
				//直接将结果参数转换为下一个节点的请求参数
				flowRep=result
			}
		} else {
			//如果没有执行完，说明这个节点是异步节点，直接将结果返回，待后续触发
			return result,nil
		}
	}
	
	log.Println("end flowInstance push")
	return nil,nil
}
