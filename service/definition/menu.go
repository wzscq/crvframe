package definition

import (
	"crv/frame/common"
	"os"
	"log"
	"encoding/json"
)

type menuItem struct {
	ID string `json:"id"`
  Name interface{} `json:"name"`
  Description interface{} `json:"description"`
	Operation *map[string]interface{} `json:"operation,omitempty"`
	Icon *string `json:"icon,omitempty"`
	Roles *interface{} `json:"roles"`
	OpenLabel *interface{} `json:"openLabel,omitempty"`
	Children *[]menuItem `json:"children,omitempty"`
}

type menu struct {
	AppDB string
}

func (m *menu)filterUserMenus(menus *[]menuItem,userRoles string)(*[]menuItem,int){
	menuCount:=0
	for menuIndex:=range (*menus) {
		//如果有子节点，则处理子节点
		if (*menus)[menuIndex].Children!=nil&&len(*((*menus)[menuIndex].Children))>0 {
			ChildMenu,childCount:=m.filterUserMenus((*menus)[menuIndex].Children,userRoles)
			if(childCount>0){
				//如果子节点都没有权限，则将父节点也删除
				(*menus)[menuCount]=(*menus)[menuIndex]
				(*menus)[menuCount].Children=ChildMenu
				menuCount++
			}
		} else {
			if HasRight((*menus)[menuIndex].Roles,userRoles) {
				(*menus)[menuCount]=(*menus)[menuIndex]
				menuCount++
			}
		}
	}	
	(*menus)=(*menus)[:menuCount]
	return menus,menuCount
}

func (m *menu)getUserMenus(userRoles string)(*[]menuItem,int){
	
	menuFile := "apps/"+m.AppDB+"/menus/menus.json"
	filePtr, err := os.Open(menuFile)
	if err != nil {
        log.Println("Open file failed [Err:%s]", err.Error())
        return nil,common.ResultOpenFileError
    }
    defer filePtr.Close()

	var fMenus []menuItem
	// 创建json解码器
    decoder := json.NewDecoder(filePtr)
    err = decoder.Decode(&fMenus)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return nil,common.ResultJsonDecodeError
	}

	//根据角色过滤出菜单列表
	menus,_:=m.filterUserMenus(&fMenus,userRoles)
	return menus,common.ResultSuccess
}