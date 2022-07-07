package data

import (
	"crv/frame/common"
	"crv/frame/definition"
	"log"
	"strconv"
	"strings"
)

type pagination struct {
    Current int `json:"current"` 
    PageSize int `json:"pageSize"` 
}

type field struct {
	Field string `json:"field"`
    DataType *string `json:"dataType,omitempty"`
	//以下字段是在关联字段的级联查询中需要携带的参数，用于关联表数据的查询
	FieldType *string `json:"fieldType,omitempty"`
	RelatedModelID *string `json:"relatedModelID,omitempty"`
	RelatedField *string `json:"relatedField,omitempty"`
	AssociationModelID *string `json:"associationModelID,omitempty"`
	ViewID *string `json:"viewID,omitempty"`
	Pagination *pagination `json:"pagination,omitempty"`
	Filter *map[string]interface{} `json:"filter,omitempty"`
	Fields *[]field `json:"fields,omitempty"`
	Sorter *[]sorter `json:"sorter,omitempty"` 
}

type queryResult struct {
	ModelID string `json:"modelID"`
	ViewID *string `json:"viewID,omitempty"`
	Value *string `json:"value,omitempty"`
	Total int `json:"total"`
	List []map[string]interface{} `json:"list"`
}

type sorter struct {
	Field string `json:"field"`
	Order string `json:"order"` 	
}

type sqlParam struct {
	Fields string
	Where string
	Limit string
	Sorter string
}

type Query struct {
	ModelID string `json:"modelID"`
	ViewID *string `json:"viewID"`
	Pagination *pagination `json:"pagination"`
	Filter *map[string]interface{} `json:"filter"`
	Fields *[]field `json:"fields"`
	AppDB string `json:"appDB"`
	Sorter *[]sorter `json:"sorter"` 
	UserRoles string `json:"userRoles"` 
}

func (query *Query) getQueryFields(permissionFields string)(string,int) {
	var fields string
	if query.Fields==nil||
		len(*(query.Fields)) == 0 {
		return fields,common.ResultQueryFieldNotFound
	}

	permissionFields=","+permissionFields+","

	for _, field := range *(query.Fields) {
		//判断是否拥有字段查询权限
		if permissionFields==",*," || strings.Contains(permissionFields,","+field.Field+","){
			//由于MANY_TO_MANY和ONE_TO_MANY字段本身不对应实际数据库表中的字段，
			//需要单独处理，所以先将这两个类型的字段过滤掉
			if field.FieldType == nil {
				fields=fields+field.Field+","
			} else {
				if *(field.FieldType) !=FIELDTYPE_MANY2MANY &&
				*(field.FieldType) !=FIELDTYPE_ONE2MANY &&
				*(field.FieldType) !=FIELDTYPE_FILE{
					fields=fields+field.Field+","
				}
			}
		}
	}

	//所有查询中必须携带至少一个数据字段，如果是查询关联表的数据，则主表必须提供ID字段
	if len(fields) <=0 {
		return fields,common.ResultQueryFieldNotFound
	}

	fields=fields[0:len(fields)-1]
	return fields,common.ResultSuccess
}

func (query *Query) getQueryWhere(permissionFilter *map[string]interface{})(string,int) {
	if permissionFilter == nil {
		return FilterToSQLWhere(query.Filter)
	}

	if query.Filter == nil {
		return FilterToSQLWhere(permissionFilter)
	}

	filter:=&map[string]interface{}{
		Op_and:[]interface{}{
			*(query.Filter),
			*permissionFilter,
		},
	}

	return FilterToSQLWhere(filter)
}

func (query *Query) getQueryLimit()(string,int) {
	//如果没有提供分页信息，这里暂时给一个固定值，避免数据量过大造成性能或内存问题
	if query.Pagination==nil {
		return "0,1000",common.ResultSuccess 
	}

	if query.Pagination.PageSize<=0 || query.Pagination.Current <= 0 {
		log.Println(query.Pagination)
		return "0,0",common.ResultQueryWrongPagination
	}

	row:=strconv.Itoa((query.Pagination.Current-1)*query.Pagination.PageSize)
	count:=strconv.Itoa(query.Pagination.PageSize)
	limit:=row+","+count

	return limit,common.ResultSuccess
}

func (query *Query) getQuerySorter()(string,int) {
	if query.Sorter==nil || len(*(query.Sorter)) == 0 {
		return " id asc ",common.ResultSuccess
	}

	var sorter string
	for _, v := range *(query.Sorter) {
		sorter=sorter+v.Field+" "+v.Order+","
	}

	sorter=sorter[0:len(sorter)-1]
	return sorter,common.ResultSuccess
}

func (query *Query) getData(sqlParam *sqlParam,dataRepository DataRepository)([]map[string]interface{},int) {
	sql:="select "+sqlParam.Fields+
		" from "+query.AppDB+"."+query.ModelID+
		" where "+sqlParam.Where+
		" order by "+sqlParam.Sorter+
		" limit "+sqlParam.Limit

	res,err:=dataRepository.query(sql)
	if err!=nil {
		return nil,common.ResultSQLError
	}				
	log.Println(res)
	return res,common.ResultSuccess
}

func (query *Query) getCount(sqlParam *sqlParam,dataRepository DataRepository)(int,int) {
	sql:="select count(id) as count"+
		" from "+query.AppDB+"."+query.ModelID+
		" where "+sqlParam.Where

	res,err:=dataRepository.query(sql)
	if err!=nil {
		return 0,common.ResultSQLError
	}
	log.Println(res)
	count,err:=strconv.Atoi(res[0]["count"].(string))
	if err!=nil {
		return 0,common.ResultSQLError
	}
	log.Println(count)
	return count,common.ResultSuccess
}

func (query *Query) getSqlParam(withPermission bool)(*sqlParam,int) {
	var sqlParam sqlParam
	var errorCode int

	permissionDataset:=&definition.Dataset{
		Fields:"*",
		Filter:nil,
	}
	//获取用户模型数据权限
	if withPermission {
		permissionDataset,errorCode=definition.GetUserDataset(query.AppDB,query.ModelID,query.UserRoles,definition.DATA_OP_TYPE_QUERY)
		if errorCode != common.ResultSuccess {
			return nil,errorCode
		}
	}

	//获取需要查询的数据字段，过滤掉多对多字段和一对多字段
	sqlParam.Fields,errorCode=query.getQueryFields(permissionDataset.Fields)
	if errorCode != common.ResultSuccess {
		return nil,errorCode
	}

	sqlParam.Where,errorCode=query.getQueryWhere(permissionDataset.Filter)
	if errorCode != common.ResultSuccess {
		return nil,errorCode
	}
			
	sqlParam.Sorter,errorCode=query.getQuerySorter()
	if errorCode != common.ResultSuccess {
		return nil,errorCode
	}
	
	sqlParam.Limit,errorCode=query.getQueryLimit()
	if errorCode != common.ResultSuccess {
		return nil,errorCode
	}

	return &sqlParam,errorCode
}

func (query *Query) query(dataRepository DataRepository,withPermission bool)(*queryResult,int) {
	var errorCode int
	result:=&queryResult{
		ModelID:query.ModelID,
		ViewID:query.ViewID,
		Total:0,
		List:nil,
	}

	var sqlParam *sqlParam 
	sqlParam,errorCode=query.getSqlParam(withPermission)
	if errorCode != common.ResultSuccess {
		return result,errorCode
	}

	result.Total,errorCode=query.getCount(sqlParam,dataRepository)
	if errorCode != common.ResultSuccess {
		return result,errorCode
	}
			
	result.List,errorCode=query.getData(sqlParam,dataRepository)
	return result,errorCode
}

func (query *Query) queryRelatedModels(dataRepository DataRepository,parentList *queryResult)(int) {
	//循环所有字段，对每个关联字段进行处理
	for _, field := range *(query.Fields) {
		//由于MANY_TO_MANY和ONE_TO_MANY字段本身不对应实际数据库表中的字段，
		//需要单独处理，所以先将这两个类型的字段过滤掉
		if field.FieldType != nil {
			fieldType:=*(field.FieldType)
			querier:=GetRelatedModelQuerier(fieldType,query.AppDB,query.ModelID,query.UserRoles)
			errorCode:=querier.query(dataRepository,parentList,&field)
			if errorCode!=common.ResultSuccess {
				return errorCode
			}
		}
	}
	return common.ResultSuccess
}

func (query *Query) Execute(dataRepository DataRepository,withPermission bool)(*queryResult,int) {
	//先查本表数据
	result,errorCode:=query.query(dataRepository,withPermission)
	
	//查询关联表数据
	if errorCode==common.ResultSuccess && result.Total>0 {
		errorCode=query.queryRelatedModels(dataRepository,result)
	}

	return result,errorCode
}