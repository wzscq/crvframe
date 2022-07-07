package data

import (
	"crv/frame/common"
	"log"
	"io/ioutil"
	"encoding/base64"
	"net/http"
)

type ImageFile struct {
	ModelID string `json:"modelID"`
	List *[]map[string]interface{} `json:"list"`
	AppDB string `json:"appDB"`
	UserID string `json:"userID"`
}

func (imgFile *ImageFile)toBase64(b []byte) string {
	return base64.StdEncoding.EncodeToString(b)
}

func (imgFile *ImageFile) getBase64String(item map[string]interface{})(string,int) {
	name:=item["name"].(string)
	path:=item["path"].(string)
	fieldID:=item["field_id"].(string)
	rowID:=item["row_id"].(string)
	strID:=item["id"].(string)

	fileName:=fieldID+"_row"+rowID+"_id"+strID+"_"+name

	bytes, err := ioutil.ReadFile(path+fileName)
	if err != nil {
		log.Println(err)
		return "",common.ResultOpenFileError
	}
	
	mimeType := http.DetectContentType(bytes)

	var base64Encoding string
	switch mimeType {
	case "image/jpeg":
		base64Encoding += "data:image/jpeg;base64,"
	case "image/png":
		base64Encoding += "data:image/png;base64,"
	}

	base64Encoding += imgFile.toBase64(bytes)

	return base64Encoding,common.ResultSuccess
}

func (imgFile *ImageFile) getImages()(*queryResult,int){
	var errorCode int
	result:=&queryResult{
		ModelID:imgFile.ModelID,
		Total:0,
		List:[]map[string]interface{}{},
	}

	var base64str string
	for _, item := range *(imgFile.List) { 
		base64str,errorCode=imgFile.getBase64String(item)
		if errorCode!=common.ResultSuccess {
			break
		}
		item["url"]=base64str
		result.List=append(result.List,item)
		result.Total+=1
	}	
	return result,errorCode
}