package data

import (
	"crv/frame/common"
	"log"
	"os"
	"io"
)

type Download struct {
	ModelID string `json:"modelID"`
	List *[]map[string]interface{} `json:"list"`
	AppDB string `json:"appDB"`
	UserID string `json:"userID"`
}

func (download *Download) Execute(w io.Writer)(int) {
	name:=(*(download.List))[0]["name"].(string)
	path:=(*(download.List))[0]["path"].(string)
	fieldID:=(*(download.List))[0]["field_id"].(string)
	rowID:=(*(download.List))[0]["row_id"].(string)
	strID:=(*(download.List))[0]["id"].(string)

	fileName:=fieldID+"_row"+rowID+"_id"+strID+"_"+name

	f,err:=os.Open(path+fileName)
	if err != nil {
		log.Println(err)
		return common.ResultOpenFileError
	}
	io.Copy(w,f)
	if err := f.Close(); err != nil {
		log.Println(err)
	}
	return common.ResultSuccess
}