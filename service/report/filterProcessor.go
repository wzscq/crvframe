package report

import (
	"crv/frame/common"
	"encoding/json"
	"fmt"
	"log/slog"
	"reflect"
	"regexp"
	"strings"
)

/*
1、对于用户，用户角色直接进行替换
2、对于和用户或用户角色相关的其它数据信息，需要通过配置filterData先进行关联数据查询，然后用查询结果替换filter中的参数
*/
func processFilter(
	sql, userID, userRoles string,
	filterData *map[string]interface{}) (string, int) {
	slog.Debug("processFilter start")

	replacedSql, _ := replaceFilterString(sql, filterData, userID, userRoles)

	slog.Debug("processFilter end")
	return replacedSql, common.ResultSuccess
}

func replaceFilterString(filter string, filterData *map[string]interface{}, userID, userRoles string) (string, bool) {
	//识别出过滤参数中的
	slog.Debug("replaceFilterString start", "filter", filter)
	re := regexp.MustCompile(`%{([A-Z|a-z|_|0-9|.]*)}`)
	replaceItems := re.FindAllStringSubmatch(filter, -1)
	replaced := false
	if replaceItems != nil {
		for _, replaceItem := range replaceItems {
			repalceStr := getReplaceString(replaceItem[1], filterData, userID, userRoles)
			filter = strings.Replace(filter, replaceItem[0], repalceStr, -1)
		}
		replaced = true
	}
	slog.Debug("replaceFilterString end", "filter", filter)
	return filter, replaced
}

func getReplaceString(filterItem string, filterData *map[string]interface{}, userID, userRoles string) string {
	filterRoles := userRoles
	filterRoles = strings.Replace(filterRoles, ",", "\",\"", -1)

	if filterItem == "userID" {
		return userID
	}

	if filterItem == "userRoles" {
		return filterRoles
	}

	if filterData != nil {
		return getfilterDataString(filterItem, filterData)
	}

	return filterItem
}

func getfilterDataString(path string, data *map[string]interface{}) string {
	/*
		data中按模型保存的查询结果数据，数据结构如下

		{
			fieldName1:value
			fieldName2:{ //对于关联字段，器值得结构和第一层的结构一致，允许多层级关联嵌套
				modelID:core_user
				value
				total
				list:[
					{
						id:value,
						name:value
					}
				]
			},
			...
		}
		基于以上数据结构，在查询条件中引用某个字段值的情况和使用方式如下：
		1、第一层结构通过参数字段名称引用，后续层级如果是关联表字段，都是通过关联字段引用的，使用关联字段名称来表示，
		   不同层级件使用点号间隔，距离如下：
			 fieldName1:表示fieldName1是一个普通字段，直接获取字段值；
		   fieldName2.id：表示fieldName2是一个关联字段，获取fieldName2字段关联表对应的id字段的值；
		2、通常对于每个层级都存在多条记录的情况，将会自动获取所有层级记录中的所有值，并进行去重处理，去重后的值生成
		   如下字符串形式：role1","role2","role3，因此在配置查询条件时，应该使用类似
		   {Op.in:["%{core_user.roles.id}"]}这样的形式，程序会将变量%{core_user.roles.id}替换为role1","role2","role3
		   替换后的字符将改为：{Op.in:["role1","role2","role3"]}
	*/
	//首先对path按照点好拆分
	values := []string{}
	pathNodes := strings.Split(path, ".")
	getPathData(pathNodes, 0, data, &values)
	//将value转为豆号分割的字符串
	if len(values) > 0 {
		valueStr := strings.Join(values, "\",\"")
		return valueStr
	}
	return path
}

func getPathData(path []string, level int, data *map[string]interface{}, values *[]string) {
	pathNode := path[level]

	dataStr, _ := json.Marshal(data)
	slog.Debug("getPathData", "pathNode", pathNode, "level", level, "dataStr", string(dataStr))

	dataNode, ok := (*data)[pathNode]
	if !ok {
		slog.Error("getPathData no pathNode ", "pathNode", pathNode)
		return
	}

	//如果当前层级为最后一层
	if len(path) == (level + 1) {
		switch dataNode.(type) {
		case string:
			sVal, _ := dataNode.(string)
			*values = append(*values, sVal)
		case int64:
			iVal, _ := dataNode.(int64)
			sVal := fmt.Sprintf("%d", iVal)
			*values = append(*values, sVal)
		default:
			slog.Error("getPathData not supported value type", "type", reflect.TypeOf(dataNode))
		}
	} else {
		//如果不是最后一级，则数据中应该存在list属性
		slog.Debug("dataNode type", "type", reflect.TypeOf(dataNode))
		result, ok := dataNode.(map[string]interface{})
		if !ok {
			slog.Error("getPathData dataNode is not a map[string]interface{} ")
			return
		}

		list, ok := result["list"].([]interface{})
		if !ok {
			slog.Error("getPathData dataNode do not contain the list element ")
			return
		}

		for _, row := range list {
			rowMap, _ := row.(map[string]interface{})
			getPathData(path, level+1, &rowMap, values)
		}
		return
	}
}
