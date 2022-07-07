package data

import (
	"log"
	"crv/frame/common"
)

type QueryOneToMany struct {
	AppDB string `json:"appDB"`
	UserRoles string `json:"userRoles"` 
}

func (queryOneToMany *QueryOneToMany)mergeResult(res *queryResult,relatedRes *queryResult,refField *field){
	relatedFieldName:=*(refField.RelatedField)
	fieldName:=refField.Field
	//将每一行的结果按照ID分配到不同的记录行上的关联字段上
	//循环结果的每行数据
	for _,relatedRow:=range relatedRes.List {
		for _,row:=range res.List {
			//一对多字段,关联表的关联字段存储了本表的ID，
			value, ok := row[fieldName]
			if !ok {
				value=&queryResult{
					ModelID:*(refField.RelatedModelID),
					ViewID:refField.ViewID,
					Total:0,
					List:[]map[string]interface{}{},
				}
				row[fieldName]=value
			}
			log.Println(row["id"],relatedRow[relatedFieldName])
			//所以判断本表ID的值和关联表对应关联字段的值是否相等
			if row["id"] == relatedRow[relatedFieldName] {
				value.(*queryResult).Total+=1
				value.(*queryResult).List=append(value.(*queryResult).List,relatedRow)
			}
		}
	}
}

func (queryOneToMany *QueryOneToMany)getFilter(parentList *queryResult,refField *field)(*map[string]interface{}){
	//一对多字段本身是虚拟字段，需要取本表的ID字段到关联表中的关联字段查找和当前表ID字段值相同的记录
	//首先获取用于过滤的ID列表
	ids:=GetFieldValues(parentList,"id")
	inCon:=map[string]interface{}{}
	inCon[Op_in]=ids
	relatedField:=*(refField.RelatedField)
	inClause:=map[string]interface{}{}
	inClause[relatedField]=inCon
	if refField.Filter == nil {
		return &inClause
	}
	filter:= map[string]interface{}{}
	filter[Op_and]=[]interface{}{inClause,refField.Filter}
	return &filter
}

func (queryOneToMany *QueryOneToMany) query(dataRepository DataRepository,parentList *queryResult,refField *field)(int) {
	if refField.RelatedModelID == nil {
		return common.ResultNoRelatedModel
	}

	if refField.RelatedField == nil {
		return common.ResultNoRelatedField
	}

	filter:=queryOneToMany.getFilter(parentList,refField)
	//执行查询，构造一个新的Query对象进行子表的查询，这样可以实现多层级数据表的递归查询操作
	refQuery:=&Query{
		ModelID:*(refField.RelatedModelID),
		ViewID:refField.ViewID,
		Pagination:refField.Pagination,
		Filter:filter,
		Fields:refField.Fields,
		AppDB:queryOneToMany.AppDB,
		Sorter:refField.Sorter,
		UserRoles:queryOneToMany.UserRoles,
	}
	result,errorCode:=refQuery.Execute(dataRepository,true)
	//更新查询结果到父级数据列表中
	if errorCode==common.ResultSuccess {
		queryOneToMany.mergeResult(parentList,result,refField)
	}
	return errorCode
}

