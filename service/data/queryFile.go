package data

import (
	"crv/frame/common"
	"log"
)

type QueryFile struct {
	AppDB string `json:"appDB"`
	ModelID string `json:"modelID"`
	UserRoles string `json:"userRoles"` 
}

func (queryFile *QueryFile)mergeResult(res *queryResult,relatedRes *queryResult,refField *field){
	relatedFieldName:="row_id"
	fieldName:=refField.Field
	//将每一行的结果按照ID分配到不同的记录行上的关联字段上
	//循环结果的每行数据
	for _,relatedRow:=range relatedRes.List {
		for _,row:=range res.List {
			//一对多字段,关联表的关联字段存储了本表的ID，
			value, ok := row[fieldName]
			if !ok {
				value=&queryResult{
					Total:0,
					ModelID:"core_file",
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

func (queryFile *QueryFile)getFilter(parentList *queryResult,fileField *field)(*map[string]interface{}){
	//文件表的查询，需要通过model_id,file_id,row_id三个字段来查询
	//首先获取用于过滤的ID列表
	ids:=GetFieldValues(parentList,"id")
	rowCon:=map[string]interface{}{}
	rowCon[Op_in]=ids
	inClause:=map[string]interface{}{}
	inClause["row_id"]=rowCon

	fieldName:=fileField.Field
	fieldCon:=map[string]interface{}{}
	fieldCon["field_id"]=fieldName

	modelCon:=map[string]interface{}{}
	modelCon["model_id"]=queryFile.ModelID
	
	filter:= map[string]interface{}{}
	if fileField.Filter == nil {
		filter[Op_and]=[]interface{}{inClause,fieldCon,modelCon}
	} else {
		filter[Op_and]=[]interface{}{inClause,fieldCon,modelCon,fileField.Filter}
	}
	
	return &filter
}

func (queryFile *QueryFile)getQueryFields()(*[]field){
	fields:=[]field{
		field{
			Field:"id",
		},
		field{
			Field:"model_id",
		},
		field{
			Field:"field_id",
		},
		field{
			Field:"row_id",
		},
		field{
			Field:"path",
		},
		field{
			Field:"name",
		},
		field{
			Field:"ext",
		},
		field{
			Field:"create_time",
		},
		field{
			Field:"create_user",
		},
		field{
			Field:"update_time",
		},
		field{
			Field:"update_user",
		},
		field{
			Field:"version",
		},
	}
	return &fields
}

func (queryFile *QueryFile) query(dataRepository DataRepository,parentList *queryResult,refField *field)(int) {
	filter:=queryFile.getFilter(parentList,refField)
	files:=queryFile.getQueryFields()
	//执行查询，构造一个新的Query对象进行子表的查询，这样可以实现多层级数据表的递归查询操作
	fileQuery:=&Query{
		ModelID:"core_file",
		ViewID:refField.ViewID,
		Pagination:refField.Pagination,
		Filter:filter,
		Fields:files,
		AppDB:queryFile.AppDB,
		Sorter:refField.Sorter,
		UserRoles:queryFile.UserRoles,
	}
	result,errorCode:=fileQuery.Execute(dataRepository,true)
	//更新查询结果到父级数据列表中
	if errorCode==common.ResultSuccess {
		queryFile.mergeResult(parentList,result,refField)
	}
	return errorCode
}
