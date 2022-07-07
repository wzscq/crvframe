package flow

import (
    "time"
)

type instanceNode struct {
	ID string `json:"id"`
	Completed bool `json:"completed"`
	StartTime string `json:"startTime"`
	EndTime *string `json:"endTime,omitempty"`
	Data []interface{} `json:"data,omitempty"`
	UserID string `json:"userID,omitempty"`
}

func createInstanceNode(id string)(*instanceNode){
	return &instanceNode{
		ID:id,
		Completed:false,
		StartTime:time.Now().Format("2006-01-02 15:04:05"),
	}
}

