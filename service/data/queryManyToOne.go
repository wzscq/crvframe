package data

import (
	"crv/frame/common"
)

type QueryManyToOne struct {
	AppDB string `json:"appDB"`
	UserRoles string `json:"userRoles"` 
}

func (queryManyToOne *QueryManyToOne)mergeResult(res *queryResult,relatedRes *queryResult,refField *field){
	relatedFieldName:="id"
	fieldName:=refField.Field
	//将每一行的结果按照ID分配到不同的记录行上的关联字段上
	//循环结果的每行数据
	for _,relatedRow:=range relatedRes.List {
		for _,row:=range res.List {
			value:=row[fieldName]
			strValue:=""
			switch value.(type) {
			case string:
				strValue=value.(string)
				value=&queryResult{
					ModelID:*(refField.RelatedModelID),
					ViewID:refField.ViewID,
					Total:0,
					Value:&strValue,
					List:[]map[string]interface{}{},
				}
				row[fieldName]=value
			case *queryResult:
				strValue=*(value.(*queryResult).Value)
			}

			if strValue == relatedRow[relatedFieldName] {
				value.(*queryResult).Total+=1
				value.(*queryResult).List=append(value.(*queryResult).List,relatedRow)
			}
		}
	}
}

func (queryManyToOne *QueryManyToOne)getFilter(parentList *queryResult,refField *field)(*map[string]interface{}){
	//多对一字段本身是数据字段，这个字段的值是对应关联表的ID字段的值
	//查询时就是查询关联表ID字段值在当前字段值列表中的记录
	//查询时同时需要合并字段上本身携带的过滤条件
	//首先获取用于过滤的ID列表
	ids:=GetFieldValues(parentList,refField.Field)
	if len(ids) == 0 {
		return nil
	}

	inCon:=map[string]interface{}{}
	inCon[Op_in]=ids
	inClause:=map[string]interface{}{}
	inClause["id"]=inCon
	if refField.Filter == nil {
		return &inClause 
	}

	filter:= map[string]interface{}{}
	filter[Op_and]=[]interface{}{inClause,refField.Filter}
	return &filter
}

func (queryManyToOne *QueryManyToOne) query(dataRepository DataRepository,parentList *queryResult,refField *field)(int) {
	if refField.RelatedModelID == nil {
		return common.ResultNoRelatedModel
	}
	filter:=queryManyToOne.getFilter(parentList,refField)

	if filter == nil {
		return common.ResultSuccess
	}
	
	//执行查询，构造一个新的Query对象进行子表的查询，这样可以实现多层级数据表的递归查询操作
	refQuery:=&Query{
		ModelID:*(refField.RelatedModelID),
		ViewID:refField.ViewID,
		Pagination:refField.Pagination,
		Filter:filter,
		Fields:refField.Fields,
		AppDB:queryManyToOne.AppDB,
		Sorter:refField.Sorter,
		UserRoles:queryManyToOne.UserRoles,
	}
	result,errorCode:=refQuery.Execute(dataRepository,true)
	//更新查询结果到父级数据列表中
	if errorCode==common.ResultSuccess {
		queryManyToOne.mergeResult(parentList,result,refField)
	}
	return errorCode
}