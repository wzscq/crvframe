package definition

import (
	"log"
	"encoding/json"
	"os"
	"crv/frame/common"
)

type permissionOperation struct {
	ID string `json:"id"`
	Roles *interface{} `json:"roles"`
}

type permissionView struct {
	ID string `json:"id"`
	Roles *interface{} `json:"roles"`
}

type permissions struct {
	Views []permissionView `json:"views"`
	Operations []permissionOperation `json:"operations"`
}

type Sorter struct {
	Field string `json:"field"`
	Order string `json:"order"` 	
}

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
	SelectedRows *interface{} `json:"selectedRows,omitempty"`
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
	FilterData []map[string]interface{} `json:"filterData,omitempty"`
	Filter map[string]interface{} `json:"filter"`
	Sorter []Sorter `json:"sorter"`
	Toolbar *viewToolbarConf `json:"toolbar,omitempty"`
	Roles *interface{} `json:"roles"`
	RowStyle *string `json:"rowStyle,omitempty"`
}

type modelConf struct {
	ModelID string `json:"modelID"`
	Fields []fieldConf `json:"fields"`
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

func (m *model)getUserPermissonOperations(operations []permissionOperation,userRoles string)([]permissionOperation){
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

func (m *model)getUserPermissonViews(views []permissionView,userRoles string)([]permissionView){
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

func (m *model)getModelConf(modelID string)(*modelConf,int){
	var mConf modelConf
	modelFile := "apps/"+m.AppDB+"/models/"+modelID+"/model.json"
	filePtr, err := os.Open(modelFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return nil,common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	err = decoder.Decode(&mConf)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return nil,common.ResultJsonDecodeError
	}

	return &mConf,common.ResultSuccess
}

func (m *model)getPermissions(modelID,userRoles string)(*permissions,int){
	var ps permissions
	modelFile := "apps/"+m.AppDB+"/models/"+modelID+"/permissions.json"
	filePtr, err := os.Open(modelFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return nil,common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	err = decoder.Decode(&ps)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return nil,common.ResultJsonDecodeError
	}

	//按照userRoles过滤视图和操作
	ps.Operations=m.getUserPermissonOperations(ps.Operations,userRoles)
	ps.Views=m.getUserPermissonViews(ps.Views,userRoles)

	return &ps,common.ResultSuccess
}

func (m *model)getModelView(modelID,viewID string)(*viewConf,int){
	var view viewConf
	viewFile := "apps/"+m.AppDB+"/models/"+modelID+"/views/"+viewID+".json"
	filePtr, err := os.Open(viewFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return nil,common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	err = decoder.Decode(&view)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return nil,common.ResultJsonDecodeError
	}

	return &view,common.ResultSuccess
}

func (m *model)getModelOperation(modelID,operationID string)(*operationConf,int){
	var op operationConf
	operationFile := "apps/"+m.AppDB+"/models/"+modelID+"/operations/"+operationID+".json"
	filePtr, err := os.Open(operationFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return nil,common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	err = decoder.Decode(&op)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return nil,common.ResultJsonDecodeError
	}

	return &op,common.ResultSuccess
}

func (m *model)getModelViews(modelID string,views []permissionView)([]viewConf,int){
	viewConfs:=[]viewConf{}
	for _,viewItem:=range(views) {
		view,err:=m.getModelView(modelID,viewItem.ID)
		if err==common.ResultSuccess {
			viewConfs=append(viewConfs,*view)
		}
	}
	return viewConfs,common.ResultSuccess
}

func (m *model)getModelOperations(modelID string,operations []permissionOperation)([]operationConf,int){
	operationConfs:=[]operationConf{}
	for _,operationItem:=range(operations) {
		operation,err:=m.getModelOperation(modelID,operationItem.ID)
		if err==common.ResultSuccess {
			operationConfs=append(operationConfs,*operation)
		}
	}
	return operationConfs,common.ResultSuccess
}

func (m *model)getModelViewConfV2(modelID,userRoles string)(modelViewConf,int){
	log.Println("getModelViewConfV2 start")
	var mvConf modelViewConf
	modelConf,err:=m.getModelConf(modelID)
	if err!=common.ResultSuccess {
		return mvConf,err
	}
	mvConf.ModelID=modelID;
	mvConf.Fields=modelConf.Fields;

	//获取权限信息
	permisson,err:=m.getPermissions(modelID,userRoles)
	if err!=common.ResultSuccess {
		return mvConf,err
	}

	//获取操作配置
	mvConf.Operations,_=m.getModelOperations(modelID,permisson.Operations)
	
	//获取视图配置
	mvConf.Views,_=m.getModelViews(modelID,permisson.Views)

	return mvConf,common.ResultSuccess
}

func (m *model)getModelViewConf(modelID,userRoles string)(modelViewConf,int){
	var mvConf modelViewConf
	modelFile := "apps/"+m.AppDB+"/models/"+modelID+".json"
	filePtr, err := os.Open(modelFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		if os.IsNotExist(err) {
			return m.getModelViewConfV2(modelID,userRoles)
		}
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

func (m *model)loadModelForm(modelID,formID string)(formConf,int){
	var form formConf
	formFile := "apps/"+m.AppDB+"/models/"+modelID+"/forms/"+formID+".json"
	filePtr, err := os.Open(formFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return form,common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	err = decoder.Decode(&form)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return form,common.ResultJsonDecodeError
	}

	return form,common.ResultSuccess
}

func (m *model)getModelFormConfV2(modelID,formID,userRoles string)(modelFormConf,int){
	log.Println("getModelFormConfV2 start")
	var mfConf modelFormConf
	modelConf,err:=m.getModelConf(modelID)
	if err!=common.ResultSuccess {
		return mfConf,err
	}
	mfConf.ModelID=modelID;
	mfConf.Fields=modelConf.Fields;

	//获取权限信息
	permisson,err:=m.getPermissions(modelID,userRoles)
	if err!=common.ResultSuccess {
		return mfConf,err
	}

	//获取操作配置
	mfConf.Operations,_=m.getModelOperations(modelID,permisson.Operations)
	
	//获取视图配置
	form,err:=m.loadModelForm(modelID,formID)
	if err!=common.ResultSuccess {
		return mfConf,err
	}
	mfConf.Forms=[]formConf{form} 

	return mfConf,common.ResultSuccess
}

func (m *model)getModelFormConf(modelID,formID,userRoles string)(modelFormConf,int){
	var mfConf modelFormConf
	modelFile := "apps/"+m.AppDB+"/models/"+modelID+".json"
	filePtr, err := os.Open(modelFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		if os.IsNotExist(err) {
			return m.getModelFormConfV2(modelID,formID,userRoles)
		}
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