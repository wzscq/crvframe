package definition

import (
	"crv/frame/common"
	"encoding/json"
	"log/slog"
	"os"
	"strings"
)

type ModelConf struct {
	ModelID string      `json:"modelID"`
	Fields  []fieldConf `json:"fields"`
}

type Dataset struct {
	ID            string                  `json:"id"`
	Filter        *map[string]interface{} `json:"filter"`
	Fields        string                  `json:"fields"`
	QueryRoles    *interface{}            `json:"queryRoles"`
	MutationRoles *interface{}            `json:"mutationRoles"`
	FilterData	  *[]interface{}       	  `json:"filterData"`
	NeedFilterProcess    bool             `json:"needFilterProcess"`
	NeedFilterData bool                   `json:"needFilterData"`
}

type ModelDataSet struct {
	ModelID  string    `json:"modelID"`
	Datasets []Dataset `json:"datasets"`
	FilterData	  *[]interface{}  `json:"filterData"`
}

const (
	DATA_OP_TYPE_QUERY    = "query"
	DATA_OP_TYPE_MUTATION = "mutation"
)

const (
	Op_or = "Op.or"
)

func MergeDatasets(datasets []Dataset) *Dataset {
	//一组dataset中的字段和过滤条件合并到一个dataset中
	filter := []map[string]interface{}{}
	fields := ""
	needFilterData:=false
	needFilterProcess:=false
	for dsIndex := range datasets {
		dataset := datasets[dsIndex]
		//所有数据集中如果存在不附带查询条件的，则其他数据集携带的条件可以忽略
		if filter != nil {
			if dataset.Filter != nil && len(*(dataset.Filter)) > 0 {
				filter = append(filter, *(dataset.Filter))
			} else {
				filter = nil
			}
		}

		//所有数据集中如果存在不规定查询字段的，则其他数据集的查询字段限制可以忽略
		if fields != "*" && len(dataset.Fields) > 0 {
			if dataset.Fields == "*" {
				fields = "*"
			} else {
				fields = fields + "," + dataset.Fields
			}
		}

		if dataset.NeedFilterData {
			needFilterData=true
		}

		if dataset.NeedFilterProcess {
			needFilterProcess=true
		
		}
	}

	dataset := Dataset{
		Fields: fields,
		NeedFilterData:needFilterData,
		NeedFilterProcess:needFilterProcess,
	}

	if len(filter) > 0 {
		if len(filter) > 1 {
			dataset.Filter = &map[string]interface{}{
				Op_or: filter,
			}
		} else {
			dataset.Filter = &filter[0]
		}
	}

	return &dataset
}

func GetUserDataset(appDB string, modelID string, userRoles string, opType string) (*Dataset, int) {
	slog.Debug("start GetUserDataset with parameters:", "appDB", appDB, "modelID", modelID, "userRoles", userRoles, "opType", opType)

	modelFile := "apps/" + appDB + "/models/" + modelID + ".json"
	filePtr, err := os.Open(modelFile)
	if err != nil {
		slog.Warn("Open file failed", "error", err)
		if os.IsNotExist(err) {
			modelFile = "apps/" + appDB + "/models/" + modelID + "/datasets.json"
			filePtr, err = os.Open(modelFile)
			if err != nil {
				slog.Error("Open file failed", "error", err)
				return nil, common.ResultOpenFileError
			}
		} else {
			return nil, common.ResultOpenFileError
		}
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	modelDataset := ModelDataSet{}
	err = decoder.Decode(&modelDataset)
	if err != nil {
		slog.Error("json file decode failed", "error", err)
		return nil, common.ResultJsonDecodeError
	}

	// 获取有权限的数据集
	dsCount := 0
	for dsIndex := range modelDataset.Datasets {
		if HasRight(modelDataset.Datasets[dsIndex].MutationRoles, userRoles) ||
			(opType == DATA_OP_TYPE_QUERY &&
				HasRight(modelDataset.Datasets[dsIndex].QueryRoles, userRoles)) {
			modelDataset.Datasets[dsCount] = modelDataset.Datasets[dsIndex]
			dsCount++
		}
	}

	if dsCount == 0 {
		slog.Error("end GetUserDataset no permission with parameters", "appDB", appDB, "modelID", modelID, "userRoles", userRoles, "opType", opType)
		return nil, common.ResultNoPermission
	}

	slog.Error("end GetUserDataset no permission with parameters", "appDB", appDB, "modelID", modelID, "userRoles", userRoles, "opType", opType,"dsCount",dsCount)

	modelDataset.Datasets = modelDataset.Datasets[:dsCount]

	//合并为一个数据集对象
	dataset := MergeDatasets(modelDataset.Datasets)

	if dataset.NeedFilterData == true {
		dataset.FilterData=modelDataset.FilterData
	}

	if dataset.Filter != nil {
		slog.Debug("dataset.Filter", "filter", dataset.Filter)
	}
	slog.Debug("end GetUserDataset with result", "result", dataset)

	return dataset, common.ResultSuccess
}

func GetModelConf(appDB string, modelID string) (*ModelConf, int) {
	modelFile := "apps/" + appDB + "/models/" + modelID + ".json"
	filePtr, err := os.Open(modelFile)
	if err != nil {
		slog.Error("Open file failed", "error", err)
		if os.IsNotExist(err) {
			modelFile = "apps/" + appDB + "/models/" + modelID + "/model.json"
			filePtr, err = os.Open(modelFile)
			if err != nil {
				return nil, common.ResultOpenFileError
			}
		} else {
			return nil, common.ResultOpenFileError
		}
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	modelConf := &ModelConf{}
	err = decoder.Decode(modelConf)
	if err != nil {
		slog.Error("json file decode failed", "error", err)
		return nil, common.ResultJsonDecodeError
	}

	return modelConf, common.ResultSuccess
}

func HasRight(roles *interface{}, userRoles string) bool {
	slog.Debug("start HasRight with parameters", "roles", roles, "userRoles", userRoles)

	if roles == nil {
		slog.Debug("end HasRight with nil roles")
		return false
	}

	userRoles = "," + userRoles + ","
	rolesStr, ok := (*roles).(string)
	if ok {
		if rolesStr == "*" {
			return true
		}

		if strings.Contains(userRoles, ","+rolesStr+",") {
			return true
		}
		return false
	}

	rolesArr, ok := (*roles).([]interface{})
	if ok {
		for idx := range rolesArr {
			rolesStr, ok := (rolesArr[idx]).(string)
			if ok {
				if strings.Contains(userRoles, ","+rolesStr+",") {
					return true
				}
			}
		}
	}

	slog.Debug("end HasRight with false")
	return false
}
