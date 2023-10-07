package data

import (
	"crv/frame/common"
	"database/sql"
	"log/slog"
	"encoding/base64"
	"os"
	"strings"
	"strconv"
)

const (
	CC_FILECONTENT = "contentBase64"
	CC_FILENAME = "name"
)

type SaveFile struct {
	AppDB string `json:"appDB"`
	UserID string `json:"userID"`
	FieldName string `json:"fieldName"`
}

func (save *SaveFile)save(pID string,dataRepository DataRepository,tx *sql.Tx,modelID string,fieldValue map[string]interface{})(int){
	slog.Debug("start SaveFile save ... ")
	mapList,ok:=fieldValue["list"]
	if !ok {
		slog.Debug("saveManyToManyField end ")
		return common.ResultSuccess
	}

	list,ok:=mapList.([]interface{})
	if !ok || len(list)<=0 {
		slog.Debug("saveManyToManyField end ")
		return common.ResultSuccess
	}

	for _,row:=range list {
		mapRow,ok:=row.(map[string]interface{})
		if(!ok){
			continue
		}
		errorCode:=save.saveFileRow(dataRepository,tx,modelID,pID,mapRow)
		if errorCode!=common.ResultSuccess {
			return errorCode
		}
	}

	slog.Debug("end SaveFile save")
	return common.ResultSuccess
}

func (save *SaveFile)saveFileRow(dataRepository DataRepository,tx *sql.Tx,modelID,pID string,row map[string]interface{})(int){
	saveType:=row[SAVE_TYPE_COLUMN]
	switch saveType {
		case SAVE_CREATE:
			return save.createFileRow(dataRepository,tx,modelID,pID,row)
		case SAVE_DELETE:
			return save.deleteFileRow(dataRepository,tx,row)
		default:
			return common.ResultNotSupportedSaveType
	}
}

func (save *SaveFile)saveFile(path,name,contentBase64 string)(int){
	//判断并创建文件路径
	err := os.MkdirAll(path, 0750)
	if err != nil && !os.IsExist(err) {
		slog.Error("create dir error:","error",err)
		return common.ResultCreateDirError
	}

	//Base64转码
	//log.Printf("file content: %s",contentBase64)
	//去掉url头信息
	typeIndex:=strings.Index(contentBase64, "base64,")
	if typeIndex>0 {
		contentBase64=contentBase64[typeIndex+7:]
	}
	fileContent := make([]byte, base64.StdEncoding.DecodedLen(len(contentBase64)))
	n, err := base64.StdEncoding.Decode(fileContent, []byte(contentBase64))
	if err != nil {
		slog.Error("decode error","error",err)
		return common.ResultBase64DecodeError
	}
	fileContent = fileContent[:n]

	//保存文件
	file,err:=os.Create(path+name)
	if err != nil {
		slog.Error("create file error","error",err)
		return common.ResultCreateFileError
	}

	if _, err := file.Write(fileContent); err != nil {
		slog.Error("write file error","error",err)
		return common.ResultCreateFileError
	}

	if err := file.Close(); err != nil {
		slog.Error("close file error","error",err)
		return common.ResultCreateFileError
	}

	return common.ResultSuccess
}

func (save *SaveFile)createFileRow(dataRepository DataRepository,tx *sql.Tx,modelID,pID string,row map[string]interface{})(int){
	slog.Debug("createFileRow ... ")
	nameCol:=row[CC_FILENAME]
	if nameCol==nil {
		return common.ResultNoFileNameWhenCreate
	}

	name, ok := nameCol.(string)
	if !ok || len(name)<=0 {
		return common.ResultNoFileNameWhenCreate
	}

	contentCol:=row[CC_FILECONTENT]
	if contentCol==nil {
		return common.ResultNoFileContentWhenCreate
	}

	contentBase64, ok := contentCol.(string)
	if !ok || len(contentBase64)<=0 {
		return common.ResultNoFileContentWhenCreate
	}

	columns:="model_id,field_id,row_id,path,name,ext,"
	
	path:=common.GetConfig().File.Root+"/"+save.AppDB+"/"+modelID+"/"
	//获取文件扩展名
	ext:=""
	extIndx:=strings.LastIndex(name,".")
	if extIndx>0 {
		ext=name[extIndx+1:]
	}
	values:="'"+modelID+"','"+save.FieldName+"','"+pID+"','"+path+"','"+name+"','"+ext+"',"
	commonFields,commonFieldsValue:=GetCreateCommonFieldsValues(save.UserID)
	columns=columns+commonFields
	values=values+commonFieldsValue
	sql:="insert into "+save.AppDB+".core_file ("+columns+") values ("+values+")"
	//执行sql
	id,_,err:=dataRepository.ExecWithTx(sql,tx)
	if err != nil {
		return common.ResultSQLError
	}

	strID:=strconv.FormatInt(id,10)
	fileName:=save.FieldName+"_row"+pID+"_id"+strID+"_"+name
	errorCode:=save.saveFile(path,fileName,contentBase64)
	if errorCode!=common.ResultSuccess {
		return errorCode
	}

	slog.Debug("createFileRow end ")
	return common.ResultSuccess
}

func (save *SaveFile)deleteFile(path,fileName string){
	os.Remove(path+fileName)
}

func (save *SaveFile)deleteFileRow(dataRepository DataRepository,tx *sql.Tx,row map[string]interface{})(int){
	idCol:=row[CC_ID]
	if idCol==nil {
		return common.ResultNoIDWhenUpdate
	}

	strID, ok := idCol.(string)
	if !ok || len(strID)<=0 {
		return common.ResultNoIDWhenUpdate
	}

	nameCol:=row[CC_FILENAME]
	if nameCol==nil {
		return common.ResultNoFileNameWhenCreate
	}

	name, ok := nameCol.(string)
	if !ok || len(name)<=0 {
		return common.ResultNoFileNameWhenCreate
	}

	pathCol:=row["path"]
	if nameCol==nil {
		return common.ResultNoFileNameWhenCreate
	}

	path, ok := pathCol.(string)
	if !ok || len(path)<=0 {
		return common.ResultNoFileNameWhenCreate
	}

	fieldID,_:=row["field_id"].(string)
	rowID,_:=row["row_id"].(string)
	fileName:=fieldID+"_row"+rowID+"_id"+strID+"_"+name
	save.deleteFile(path,fileName)

	sql:="delete from "+save.AppDB+".core_file where id='"+replaceApostrophe(strID)+"'"
	//执行sql
	_,_,err:=dataRepository.ExecWithTx(sql,tx)
	if err != nil {
		return common.ResultSQLError
	}
	return common.ResultSuccess
}