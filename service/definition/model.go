package definition

import (
	"log"
	"encoding/json"
	"os"
	"crv/frame/common"
)

type fieldConf struct {
	Field string `json:"field"`
    Name interface{} `json:"name"`
    DataType string `json:"dataType"`
	QuickSearch bool `json:"quickSearch"`
	//以下字段是在关联字段的级联查询中需要携带的参数，用于关联表数据的查询
	FieldType *string `json:"fieldType,omitempty"`
	RelatedModelID *string `json:"relatedModelID,omitempty"`
	RelatedField *string `json:"relatedField,omitempty"`
	AssociationModelID *string `json:"associationModelID,omitempty"`
}

type operationConf struct {
	ID string `json:"id"`
	Name interface{} `json:"name"`
	Type string `json:"type"`
	Params map[string]interface{} `json:"params"`
	Input map[string]interface{} `json:"input"`
	Description interface{} `json:"description"`
	SuccessOperation *operationConf `json:"successOperation,omitempty"`
	ErrorOperation *operationConf `json:"errorOperation,omitempty"`
	Roles *interface{} `json:"roles"`
}

type buttonConf struct {
	OperationID string `json:"operationID"`
	Name *interface{} `json:"name,omitempty"`
	Prompt *interface{} `json:"prompt,omitempty"`
}

type toolbarConf struct {
	ShowCount int `json:"showCount"`
	Width int `json:"width"`
	Buttons  []buttonConf `json:"buttons"`
}

type viewToolbarConf struct {
	ListToolbar *toolbarConf `json:"listToolbar,omitempty"`
	RowToolbar  *toolbarConf `json:"rowToolbar,omitempty"`
}

type viewConf struct {
	ViewID string `json:"viewID"`
	Name interface{} `json:"name"`
	Description string `json:"description"`
	Fields []map[string]interface{} `json:"fields"`
	Filter map[string]interface{} `json:"filter"`
	Toolbar *viewToolbarConf `json:"toolbar,omitempty"`
	Roles *interface{} `json:"roles"`
	RowStyle *string `json:"rowStyle,omitempty"`
}

type modelViewConf struct {
	ModelID string `json:"modelID"`
	Fields []fieldConf `json:"fields"`
	Operations []operationConf `json:"operations"`
	Views []viewConf `json:"views"`
}

type formConf struct {
	FormID string `json:"formID"`
	ColCount int `json:"colCount"`
	RowCount int `json:"rowCount"`
	RowHeight int `json:"rowHeight"`
	Header map[string]interface{} `json:"header"`
	Footer map[string]interface{} `json:"footer"`
	Controls []map[string]interface{} `json:"controls"`
}

type modelFormConf struct {
	ModelID string `json:"modelID"`
	Fields []fieldConf `json:"fields"`
	Operations []operationConf `json:"operations"`
	Forms []formConf `json:"forms"`
}

type model struct {
	AppDB string
}

func (m *model)getUserOperations(operations []operationConf,userRoles string)([]operationConf){
	operationCount:=0
	for opIndex:=range operations {
		if HasRight(operations[opIndex].Roles,userRoles) {
			operations[operationCount]=operations[opIndex]
			operationCount++
		}
	}	
	operations=operations[:operationCount]
	return operations
}

func (m *model)getUserViews(views []viewConf,userRoles string)([]viewConf){
	viewCount:=0
	for vIndex:=range views {
		if HasRight(views[vIndex].Roles,userRoles) {
			views[viewCount]=views[vIndex]
			viewCount++
		}
	}	
	views=views[:viewCount]
	return views
}

func (m *model)getModelViewConf(modelID,userRoles string)(modelViewConf,int){
	var mvConf modelViewConf
	modelFile := "apps/"+m.AppDB+"/models/"+modelID+".json"
	filePtr, err := os.Open(modelFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return mvConf,common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	err = decoder.Decode(&mvConf)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return mvConf,common.ResultJsonDecodeError
	}

	//根据用户角色过滤操作
	mvConf.Operations=m.getUserOperations(mvConf.Operations,userRoles)
	
	//根据用户角色过滤视图
	mvConf.Views=m.getUserViews(mvConf.Views,userRoles)
	return mvConf,common.ResultSuccess
}

func (m *model)getModelForm(forms []formConf, formID string)([]formConf){
	var fromRes []formConf
	for _, form := range forms {
		if form.FormID == formID  {
			fromRes = append(fromRes, form)
		}
	}
	return fromRes
}

func (m *model)getModelFormConf(modelID,formID,userRoles string)(modelFormConf,int){
	var mfConf modelFormConf
	modelFile := "apps/"+m.AppDB+"/models/"+modelID+".json"
	filePtr, err := os.Open(modelFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return mfConf,common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	err = decoder.Decode(&mfConf)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return mfConf,common.ResultJsonDecodeError
	}

	//根据用户角色过滤操作
	mfConf.Operations=m.getUserOperations(mfConf.Operations,userRoles)

	//过滤对应的formID
	mfConf.Forms=m.getModelForm(mfConf.Forms,formID)	
	
	if mfConf.Forms == nil {
		return mfConf,common.ResultModelFormNotFound
	}

	return mfConf,common.ResultSuccess
}