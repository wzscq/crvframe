package definition

import (
	"crv/frame/common"
	"os"
	"log/slog"
	"encoding/json"
)

type MenuGroupItem struct {
	ID string `json:"id"`
	Name interface{} `json:"name"`
	Description interface{} `json:"description"`
	Icon *string `json:"icon,omitempty"`
	Children *[]MenuGroupItem `json:"children,omitempty"`	
	Color string `json:"color,omitempty"`
}

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

func (m *menu)getUserMenus(menuGroup,userRoles string)(*[]menuItem,int){
	
	menuFile := "apps/"+m.AppDB+"/menus/"+menuGroup+".json"
	filePtr, err := os.Open(menuFile)
	if err != nil {
        slog.Error("Open file failed","error",err)
        return nil,common.ResultOpenFileError
    }
    defer filePtr.Close()

	var fMenus []menuItem
	// 创建json解码器
    decoder := json.NewDecoder(filePtr)
    err = decoder.Decode(&fMenus)
	if err != nil {
		slog.Error("json file decode failed","error",err)
		return nil,common.ResultJsonDecodeError
	}

	//根据角色过滤出菜单列表
	menus,_:=m.filterUserMenus(&fMenus,userRoles)
	return menus,common.ResultSuccess
}

func (m *menu)getUserMenuGroups(userRoles string)(*[]MenuGroupItem,int){
	menuGroupFile := "apps/"+m.AppDB+"/menus/menuGroups.json"
	filePtr, err := os.Open(menuGroupFile)
	if err != nil {
		slog.Debug("Open menu group file failed","error",err)
		return nil,common.ResultSuccess
	}
	defer filePtr.Close()

	var menuGroups []MenuGroupItem
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	err = decoder.Decode(&menuGroups)
	if err != nil {
		slog.Error("json file decode failed","error",err)
		return nil,common.ResultJsonDecodeError
	}

	userMenuGroups,_:=m.filterUserMenuGroups(&menuGroups,userRoles)
	return userMenuGroups,common.ResultSuccess	
}

func (m *menu)filterUserMenuGroups(menuGroups *[]MenuGroupItem,userRoles string)(*[]MenuGroupItem,int){
	groupCount:=0
	for groupIndex:=range (*menuGroups) {
		//如果有子节点，则处理子节点
		if (*menuGroups)[groupIndex].Children!=nil&&len(*((*menuGroups)[groupIndex].Children))>0 {
			ChildGroup,childCount:=m.filterUserMenuGroups((*menuGroups)[groupIndex].Children,userRoles)
			if(childCount>0){
				//如果子节点都没有权限，则将父节点也删除
				(*menuGroups)[groupCount]=(*menuGroups)[groupIndex]
				(*menuGroups)[groupCount].Children=ChildGroup
				groupCount++
			}
		} else {
			_,menuCount:=m.getUserMenus((*menuGroups)[groupIndex].ID,userRoles)
			if menuCount>0 {
				(*menuGroups)[groupCount]=(*menuGroups)[groupIndex]
				groupCount++
			}
		}
	}
	(*menuGroups)=(*menuGroups)[:groupCount]
	return menuGroups,groupCount
}

func GetUserMenuGroups(appDB,userRoles string)(*[]MenuGroupItem,int){
	m:=menu{
		AppDB:appDB,
	}
	return m.getUserMenuGroups(userRoles)
}