package data 

import (
	"crv/frame/common"
	"encoding/json"
	"log"
	"regexp"
	"strings"
	"fmt"
)

/*
1、对于用户，用户角色直接进行替换
2、对于和用户或用户角色相关的其它数据信息，需要通过配置filterData先进行关联数据查询，然后用查询结果替换filter中的参数
*/
func processFilter(
	filter *map[string]interface{},
	filterData *[]filterDataItem,
	userID string,
	userRoles string,
	appDB string,
	dataRepository DataRepository)(int){
	log.Println("processFilter start")
	var filterDataRes *map[string]interface{}
	var errorCode int

	if filterData!=nil && len(*filterData)>0 {
		filterDataRes,errorCode=getFilterData(filterData,userID,userRoles,appDB,dataRepository)	
		if errorCode!=common.ResultSuccess {
			log.Println("processFilter end with error")
			return errorCode
		}		
	}

	replaceFilterVar(filter,filterDataRes,userID,userRoles)

	log.Println("processFilter end")
	return common.ResultSuccess
}

func replaceFilterVar(
	filter *map[string]interface{},
	filterData *map[string]interface{},
	userID ,userRoles string){
	//先将条件转换成json，然后再反序列化回对象
	jsonStr, err := json.Marshal(filter)
    if err != nil {
		log.Println("replaceFilterVar Marshal filter error")
        log.Println(err)
    }

	filterStr,replaced:=replaceFilterString(string(jsonStr),filterData,userID,userRoles)
	
	if replaced==true {
		if err := json.Unmarshal([]byte(filterStr), filter); err != nil {
			log.Println("replaceFilterVar Unmarshal filter error")
			log.Println(err)
		}
	}
}

func replaceFilterString(filter string,filterData *map[string]interface{},userID ,userRoles string)(string,bool){
	//识别出过滤参数中的
	log.Printf("replaceFilterString start\n")
	log.Println(filter)
	re := regexp.MustCompile(`%{([A-Z|a-z|_|0-9|.]*)}`)
	replaceItems:=re.FindAllStringSubmatch(filter,-1)
	replaced:=false
	if replaceItems!=nil {
		for _,replaceItem:=range replaceItems {
			log.Printf("replaceFilterString replaceItem:%s,%s \n",replaceItem[0],replaceItem[1])
			repalceStr:=getReplaceString(replaceItem[1],filterData,userID ,userRoles)
			filter=strings.Replace(filter,replaceItem[0],repalceStr,-1)
		}
		replaced=true
	}
	log.Printf("replaceFilterString end\n")
	log.Println(filter)
	return filter,replaced
}

func getReplaceString(filterItem string,filterData *map[string]interface{},userID ,userRoles string)(string){
	filterRoles:=userRoles;
	filterRoles=strings.Replace(filterRoles,",","\",\"",-1)
	log.Println(filterRoles)

	if filterItem=="userID" {
		return userID
	}

	if filterItem=="userRoles" {
		return filterRoles
	}

	if filterData!=nil {
		return getfilterDataString(filterItem,filterData)
	}
	
	return filterItem
}

func getfilterDataString(path string,data *map[string]interface{})(string){
	/*
		data中按模型保存的查询结果数据，数据结构如下
		{
			modelID:{
				ModelID
				Value
				Total
				List [
					{
						fieldName:value
						fieldName:{ //对于关联字段，器值得结构和第一层的结构一致，允许多层级关联嵌套
							modelID
							value
							total
							list:[...] 
						},
						...
					},
					...
				]
			}
		}
		基于以上数据结构，在查询条件中引用某个字段值的情况和使用方式如下：
		1、第一层结构通过modelID区分取值于哪个model，后续层级都是通过关联字段引用的，使用关联字段名称来表示，
		   不同层级件使用点号间隔，距离如下：
		   core_user.id：表示获取core_user表中的id字段的值；
		   core_user.roles.id：表示获取core_user表的reles关联字段表中的id字段的值；
		2、通常对于每个层级都存在多条记录的情况，将会自动获取所有层级记录中的所有值，并进行去重处理，去重后的值生成
		   如下字符串形式：role1","role2","role3，因此在配置查询条件时，应该使用类似
		   {Op.in:["%{core_user.roles.id}"]}这样的形式，程序会将变量%{core_user.roles.id}替换为role1","role2","role3
		   替换后的字符将改为：{Op.in:["role1","role2","role3"]}
	*/
	//首先对path按照点好拆分
	values:=[]string{}
	pathNodes:=strings.Split(path, ".")
	getPathData(pathNodes,0,data,&values)
	//将value转为豆号分割的字符串
	if len(values)>0 {
		valueStr:=strings.Join(values, "\",\"")
		log.Println(valueStr)
		return valueStr
	}
	return path
}

func getPathData(path []string,level int,data *map[string]interface{},values *[]string){
	pathNode:=path[level]

	dataStr, _ := json.Marshal(data)
	log.Printf("getPathData pathNode:%s,level:%d,data:%s",pathNode,level,string(dataStr))

	dataNode,ok:=(*data)[pathNode]
	if !ok {
		log.Println("getPathData no pathNode ",pathNode)
		return
	}

	//如果当前层级为左后一层
	if len(path)==(level+1) {
		switch dataNode.(type) {
			case string:
				sVal, _ := dataNode.(string)   
				*values=append(*values,sVal) 
			case int64:
				iVal,_:=dataNode.(int64)
				sVal:=fmt.Sprintf("%d",iVal)
				*values=append(*values,sVal) 
			default:
				log.Printf("getPathData not supported value type %T!\n", dataNode)
		}
	} else {
		//如果不是最后一级，则数据中应该存在list属性
		log.Printf("dataNode type is %T",dataNode)
		result,ok:=dataNode.(*queryResult)
		if !ok {
			log.Println("getPathData dataNode is not a queryResult ")
			return
		}

		for _,row:=range result.List {
			if ok {
				log.Println("getPathData dataNode list member is not a map ")
				getPathData(path,level+1,&row,values)
			}
		}
		return
	}
}

func getFilterData(
	filterData *[]filterDataItem,
	userID ,userRoles,appDB string,
	dataRepository DataRepository)(*map[string]interface{},int){

	log.Printf("getFilterData start\n")
	
	res:=map[string]interface{}{}
	
	//循环查询每个filterData的数据
	for _,item:=range(*filterData){
		if item.Filter!= nil {
			replaceFilterVar(item.Filter,nil,userID,userRoles)
		}
		//创建query查询数据
		query:=&Query{
			ModelID:item.ModelID,
			Filter:item.Filter,
			Fields:item.Fields,
			AppDB:appDB,
			UserRoles:userRoles,
		}
		result,errorCode:=query.Execute(dataRepository,false)	
		if errorCode!=common.ResultSuccess {
			return nil,errorCode
		}
		res[item.ModelID]=result
	}

	log.Printf("getFilterData end\n")
	return &res,common.ResultSuccess
}