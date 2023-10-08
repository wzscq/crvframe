package esi

import (
	"log/slog"
	"github.com/xuri/excelize/v2"
	"crv/frame/common"
	"strings"
	"bytes"
	"encoding/base64"
	"strconv"
	"regexp"
)

type esiCell struct {
	Row int `json:"row"`
	Col int `json:"col"`
	Content string `json:"content"`
}

type esiFile struct {
	Name string `json:"name"`
	Cells []esiCell `json:"cells"`
}

type ContentHandler interface {
	handleCell(lastRow,row,col int,content string)(map[string]interface{})
	resetAll()
}

func base64ToFileContent(contentBase64 string)(*[]byte,*common.CommonError){
	//去掉url头信息
	typeIndex:=strings.Index(contentBase64, "base64,")
	if typeIndex>0 {
		contentBase64=contentBase64[typeIndex+7:]
	}

	fileContent := make([]byte, base64.StdEncoding.DecodedLen(len(contentBase64)))
	n, err := base64.StdEncoding.Decode(fileContent, []byte(contentBase64))
	if err != nil {
		slog.Error("decode error","error",err)
		return nil,common.CreateError(common.ResultBase64DecodeError,nil)
	}
	fileContent = fileContent[:n]
	return &fileContent,nil
}

func getSheetName(sheetNames []string,sheetSelector *SheetSelector)(string,*common.CommonError){
	if sheetSelector == nil {
		return sheetNames[0],nil
	}

	slog.Debug("getSheetName","Type",sheetSelector.Type,"Value",sheetSelector.Value)
	
	if sheetSelector.Type == SHEETSELECTOR_TYPE_INDEX {
		sheetIndex,err:=strconv.Atoi(sheetSelector.Value)
		if err!=nil {
			slog.Error(err.Error())
			return "",common.CreateError(common.ResultExcelSheetNotExist,nil)
		}

		sheetIndex=sheetIndex-1
		if sheetIndex >= 0 && sheetIndex < len(sheetNames) {
			return sheetNames[sheetIndex],nil
		}
		
		if sheetSelector.Optional == SHEETSELECTOR_OPTIONAL_NO {
			return "",common.CreateError(common.ResultExcelSheetNotExist,nil)
		}
	}

	if sheetSelector.Type == SHEETSELECTOR_TYPE_NAME {
		sheetName:=sheetSelector.Value
		for _,sheet:=range(sheetNames) {
			data := []byte(sheet)
			if ret,_:=regexp.Match(sheetName,data); ret == true	{
				return sheet,nil
			}
		}

		if sheetSelector.Optional == SHEETSELECTOR_OPTIONAL_NO {
			return "",common.CreateError(common.ResultExcelSheetNotExist,nil)
		}
	}

	return "",nil
}

func parseSheet(
	f *excelize.File,
	sheetNames []string,
	contentHandler ContentHandler,
	dataRowHandler DataRowHandler,
	sheetSelector *SheetSelector)(*common.CommonError){

	sheetName,commonErr:=getSheetName(sheetNames,sheetSelector)
	if commonErr != nil {
		return commonErr
	}

	if len(sheetName)==0 {
		return nil
	}
	// Get all the rows in the Sheet1.
	rows, err := f.GetRows(sheetName)
	if err != nil {
		slog.Error("esiFile loadBase64String error","error",err)
		return common.CreateError(common.ResultLoadExcelFileError,nil)
	}

	//每个sheet处理时重置一下之前解析的内容
	contentHandler.resetAll()

	lastRow:=-1
	for rowNo, row := range rows {
		for colNo, cellContent := range row {
			resultRowMap:=contentHandler.handleCell(lastRow,rowNo,colNo,cellContent)
			if resultRowMap!=nil {
				//保存数据行
				err:=dataRowHandler.handleRow(resultRowMap,sheetName)
				if err!=nil {
					return err
				}
			}
			lastRow=rowNo
		}
	}

	return nil
}

func parseBase64File(
	name,contentBase64 string,
	contentHandler ContentHandler,
	dataRowHandler DataRowHandler,
	sheetSelectors []SheetSelector)(*common.CommonError){
	fileContent,commonErr:=base64ToFileContent(contentBase64)
	if commonErr!=nil {
		return commonErr
	}

	reader := bytes.NewReader(*fileContent)
	f, err := excelize.OpenReader(reader)
	if err != nil {
		slog.Error("esiFile loadBase64String error","error",err)
    return common.CreateError(common.ResultLoadExcelFileError,nil)
  }
   
	sheetNames:=f.GetSheetList()
	if len(sheetNames)==0 {
		slog.Error("esiFile loadBase64String error","error","no sheet")
		return common.CreateError(common.ResultLoadExcelFileError,nil)
	}

	//如果没有指定sheet，则默认读取第一个
	if len(sheetSelectors)>0 {
		for _,sheetSelector:=range(sheetSelectors){
			err:=parseSheet(f,sheetNames,contentHandler,dataRowHandler,&sheetSelector)
			if err!=nil {
				return err
			}		
		}
	} else {
		err:=parseSheet(f,sheetNames,contentHandler,dataRowHandler,nil)
		if err!=nil {
				return err
		}
	}

	slog.Debug("esiFile loadBase64String end")
	return nil
}