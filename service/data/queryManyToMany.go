package data

import (
	"crv/frame/common"
)

type QueryManyToMany struct {
	AppDB     string `json:"appDB"`
	ModelID   string `json:"modelID"`
	UserRoles string `json:"userRoles"`
}

func (queryManyToMany *QueryManyToMany) mergeResult(res *QueryResult, relatedRes *QueryResult, refField *Field) {
	//多对多字段实际已经被转换为了一对多字段，所以这里按照一对多字段展开
	//
	relatedModelID := *(refField.RelatedModelID)

	relatedFieldName := relatedModelID + "_id"
	localRelatedFieldName := queryManyToMany.ModelID + "_id"
	fieldName := refField.Field
	//将每一行的结果按照ID分配到不同的记录行上的关联字段上
	//循环结果的每行数据
	for _, relatedRow := range relatedRes.List {
		for _, row := range res.List {
			//一对多字段,关联表的关联字段存储了本表的ID，
			value, ok := row[fieldName]
			if !ok {
				value = &QueryResult{
					ModelID: *(refField.RelatedModelID),
					ViewID:  refField.ViewID,
					Total:   0,
					List:    []map[string]interface{}{},
				}
				row[fieldName] = value
			}
			//这里的关联字段本身的值是一个多对一字段，这里取出其中的值
			if row["id"] == relatedRow[localRelatedFieldName] {
				relatedValue, ok := relatedRow[relatedFieldName].(*QueryResult)
				if ok {
					value.(*QueryResult).Total += relatedValue.Total
					//对于多对多字段来说，这里不是取中间表的数据，而是取中间表关联的下一层表的数据
					if relatedValue.Total > 0 {
						value.(*QueryResult).List = append(value.(*QueryResult).List, relatedValue.List...)
					}
				}
			}
		}
	}
}

func (queryManyToMany *QueryManyToMany) getFilter(parentList *QueryResult, refField *Field) *map[string]interface{} {
	//多对多字段，将先通过一对多方式查询中间表，然后再通过中间表的多对一查询实际的关联表
	//这里字段携带的过滤条件在查询中间表的时候不需要考虑，这些过滤条件将在后续多对一的查询中使用
	//中间表中包含了两个关联表的ID，字段名称就是模型ID+'_id'
	//先构建关联表的ID
	idFieldName := queryManyToMany.ModelID + "_id"
	//获取ID列表
	ids := GetFieldValues(parentList, "id")
	//查询条件形式应该是：idFieldName in ('id1','id2',...)
	inClause := map[string]interface{}{}
	inClause[Op_in] = ids
	filter := map[string]interface{}{}
	filter[idFieldName] = inClause
	return &filter
}

func (queryManyToMany *QueryManyToMany) getRelatedQueryFields(refField *Field) *[]Field {
	//仅针对查询中包含的多对多关联字段，
	//对于多对多关联字段的查询有程序将其转化为先按照一对多查询中间表
	//然后在按照多对一的方式查询实际的关联表方式
	//这里需要对查询的字段做一个转换
	fieldType := FIELDTYPE_MANY2ONE

	localIDField := Field{
		Field: queryManyToMany.ModelID + "_id",
	}
	manyToOneField := Field{
		Field:          *(refField.RelatedModelID) + "_id",
		FieldType:      &fieldType,
		RelatedModelID: refField.RelatedModelID,
		ViewID:         refField.ViewID,
		Pagination:     refField.Pagination,
		Filter:         refField.Filter,
		Fields:         refField.Fields,
		Sorter:         refField.Sorter,
	}
	fields := []Field{localIDField, manyToOneField}
	return &fields
}

func (queryManyToMany *QueryManyToMany) query(dataRepository DataRepository, parentList *QueryResult, refField *Field) int {
	if refField.RelatedModelID == nil {
		return common.ResultNoRelatedModel
	}

	filter := queryManyToMany.getFilter(parentList, refField)

	modelID := *(refField.RelatedModelID)
	modelID = getRelatedModelID(queryManyToMany.ModelID, modelID, refField.AssociationModelID)

	fields := queryManyToMany.getRelatedQueryFields(refField)
	//执行查询，构造一个新的Query对象进行子表的查询，这样可以实现多层级数据表的递归查询操作
	refQuery := &Query{
		ModelID:    modelID,
		Filter:     filter,
		Fields:     fields,
		Pagination: refField.Pagination,
		AppDB:      queryManyToMany.AppDB,
		UserRoles:  queryManyToMany.UserRoles,
	}
	result, errorCode := refQuery.Execute(dataRepository, false)
	//更新查询结果到父级数据列表中
	if errorCode == common.ResultSuccess {
		queryManyToMany.mergeResult(parentList, result, refField)
	}
	return errorCode

}
