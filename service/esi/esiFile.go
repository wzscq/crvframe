package esi

import (
	"log"
	"github.com/xuri/excelize/v2"
	"crv/frame/common"
	"strings"
	"bytes"
	"encoding/base64"
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
		log.Println("decode error:", err)
		return nil,common.CreateError(common.ResultBase64DecodeError,nil)
	}
	fileContent = fileContent[:n]
	return &fileContent,nil
}

func parseBase64File(
	name,contentBase64 string,
	contentHandler ContentHandler,
	dataRowHandler DataRowHandler)(*common.CommonError){
	fileContent,commonErr:=base64ToFileContent(contentBase64)
	if commonErr!=nil {
		return commonErr
	}

	reader := bytes.NewReader(*fileContent)
	f, err := excelize.OpenReader(reader)
	if err != nil {
		log.Println("esiFile loadBase64String error:")
        log.Println(err)
        return common.CreateError(common.ResultLoadExcelFileError,nil)
    }
   
	sheetNames:=f.GetSheetList()
	if len(sheetNames)==0 {
		log.Println("esiFile loadBase64String error:")
		log.Println("no sheet")
		return common.CreateError(common.ResultLoadExcelFileError,nil)
	}
    // Get all the rows in the Sheet1.
    rows, err := f.GetRows(sheetNames[0])
    if err != nil {
		log.Println("esiFile loadBase64String error:")
        log.Println(err)
        return common.CreateError(common.ResultLoadExcelFileError,nil)
    }

	lastRow:=-1
    for rowNo, row := range rows {
        for colNo, cellContent := range row {
			resultRowMap:=contentHandler.handleCell(lastRow,rowNo,colNo,cellContent)
			if resultRowMap!=nil {
				//保存数据行
				err:=dataRowHandler.handleRow(resultRowMap)
				if err!=nil {
					return err
				}
			}
			lastRow=rowNo
        }
    }

	log.Printf("esiFile loadBase64String end\n")
	return nil
}