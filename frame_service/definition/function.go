package definition

import (
	"crv/frame/common"
	"os"
	"log"
	"encoding/json"
)

type functionItem struct {
	ID string `json:"id"`
    Name interface{} `json:"name"`
    Description interface{} `json:"description"`
	Operation map[string]interface{} `json:"operation"`
	Icon string `json:"icon"`
	Roles *interface{} `json:"roles"`
	OpenLabel *interface{} `json:"openLabel,omitempty"`
}

type functionGroup struct {
	ID string `json:"id"`
    Name interface{} `json:"name"`
    Description interface{} `json:"description"`
	Children []functionItem `json:"children"`
}

type function struct {
	AppDB string
}

func (f *function)filterUserFunctions(fGroups []functionGroup,userRoles string)([]functionGroup,int){
	groupCount:=0
	for groupIndex:=range fGroups {
		childrenCount:=0
		for childrenIndex:=range fGroups[groupIndex].Children {
			if HasRight(fGroups[groupIndex].Children[childrenIndex].Roles,userRoles) {
				fGroups[groupIndex].Children[childrenCount]=fGroups[groupIndex].Children[childrenIndex]
				childrenCount++
			}
		}		
		if childrenCount > 0 {
			fGroups[groupCount]=fGroups[groupIndex]
			fGroups[groupCount].Children=fGroups[groupIndex].Children[:childrenCount]
			groupCount++
		}
	}	
	fGroups=fGroups[:groupCount]
	return fGroups,common.ResultSuccess
}

func (f *function)getUserFunction(userRoles string)([]functionGroup,int){
	
	formFile := "apps/"+f.AppDB+"/functions/function.json"
	filePtr, err := os.Open(formFile)
	if err != nil {
        log.Println("Open file failed [Err:%s]", err.Error())
        return nil,common.ResultOpenFileError
    }
    defer filePtr.Close()

	var fGroups []functionGroup
	// 创建json解码器
    decoder := json.NewDecoder(filePtr)
    err = decoder.Decode(&fGroups)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return nil,common.ResultJsonDecodeError
	}

	//根据角色过滤出功能列表
	return f.filterUserFunctions(fGroups,userRoles)
}