package flow

import (
	"crv/frame/common"
	"encoding/json"
	"github.com/rs/xid"
	"log/slog"
	"os"
	"time"
)

type node struct {
	ID       string      `json:"id"`
	Type     string      `json:"type"`
	Data     interface{} `json:"data"`
	Position interface{} `json:"position"`
}

type edge struct {
	ID     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
}

type flowConf struct {
	Label       interface{} `json:"label"`
	Description interface{} `json:"description"`
	Nodes       []node      `json:"nodes"`
	Edges       []edge      `json:"edges"`
}

func loadFlowConf(appDB, flowID string) (*flowConf, int) {
	//load flow config from file
	flowCfgFile := "apps/" + appDB + "/flows/" + flowID + ".json"
	filePtr, err := os.Open(flowCfgFile)
	if err != nil {
		slog.Error("Open flow configuration file failed", "error", err)
		return nil, common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	flowConf := &flowConf{}
	err = decoder.Decode(flowConf)
	if err != nil {
		slog.Error("json file decode failed", "error", err)
		return nil, common.ResultJsonDecodeError
	}
	return flowConf, common.ResultSuccess
}

func getInstanceID(appDB, flowID string) string {
	guid := xid.New().String()
	return appDB + "_" + flowID + "_" + guid
}

func createInstance(appDB, flowID, userID string) (*flowInstance, int) {
	flowCfg, errorCode := loadFlowConf(appDB, flowID)
	if errorCode != common.ResultSuccess {
		return nil, errorCode
	}

	instanceID := getInstanceID(appDB, flowID)

	instance := &flowInstance{
		AppDB:      appDB,
		FlowID:     flowID,
		InstanceID: instanceID,
		UserID:     userID,
		FlowConf:   flowCfg,
		Nodes:      []instanceNode{},
		Completed:  false,
		StartTime:  time.Now().Format("2006-01-02 15:04:05"),
	}

	return instance, common.ResultSuccess
}
