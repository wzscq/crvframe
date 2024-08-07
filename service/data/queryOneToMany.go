package data

import (
	"crv/frame/common"
	"log/slog"
)

type QueryOneToMany struct {
	AppDB     string `json:"appDB"`
	UserRoles string `json:"userRoles"`
}

func (queryOneToMany *QueryOneToMany) mergeResult(res *QueryResult, relatedRes *QueryResult, refField *Field) {
	relatedFieldName := *(refField.RelatedField)
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
			//slog.Debug("mergeResult","id",row["id"],"relatedFieldName",relatedRow[relatedFieldName])
			//所以判断本表ID的值和关联表对应关联字段的值是否相等
			if row["id"] == relatedRow[relatedFieldName] {
				value.(*QueryResult).Total += 1
				value.(*QueryResult).List = append(value.(*QueryResult).List, relatedRow)
			}
		}
	}
}

func (queryOneToMany *QueryOneToMany) getFilter(parentList *QueryResult, refField *Field) *map[string]interface{} {
	//一对多字段本身是虚拟字段，需要取本表的ID字段到关联表中的关联字段查找和当前表ID字段值相同的记录
	slog.Debug("getFilter", "Filter", refField.Filter)
	//首先获取用于过滤的ID列表
	ids := GetFieldValues(parentList, "id")
	inCon := map[string]interface{}{}
	inCon[Op_in] = ids
	relatedField := *(refField.RelatedField)
	inClause := map[string]interface{}{}
	inClause[relatedField] = inCon
	if refField.Filter == nil {
		return &inClause
	}
	filter := map[string]interface{}{}
	filter[Op_and] = []interface{}{inClause, *refField.Filter}
	slog.Debug("getFilter", "filter", filter)
	return &filter
}

func (queryOneToMany *QueryOneToMany) query(dataRepository DataRepository, parentList *QueryResult, refField *Field) int {
	if refField.RelatedModelID == nil {
		return common.ResultNoRelatedModel
	}

	if refField.RelatedField == nil {
		return common.ResultNoRelatedField
	}

	filter := queryOneToMany.getFilter(parentList, refField)
	//执行查询，构造一个新的Query对象进行子表的查询，这样可以实现多层级数据表的递归查询操作
	refQuery := &Query{
		ModelID:    *(refField.RelatedModelID),
		ViewID:     refField.ViewID,
		Pagination: refField.Pagination,
		Filter:     filter,
		Fields:     refField.Fields,
		AppDB:      queryOneToMany.AppDB,
		Sorter:     refField.Sorter,
		UserRoles:  queryOneToMany.UserRoles,
	}
	result, errorCode := refQuery.Execute(dataRepository, false)
	//更新查询结果到父级数据列表中
	if errorCode == common.ResultSuccess {
		queryOneToMany.mergeResult(parentList, result, refField)
	}
	return errorCode
}
