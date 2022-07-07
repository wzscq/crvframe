package data

import (
	"crv/frame/common"
	"crv/frame/definition"
	"log"
	"time"
	"database/sql"
	"strings"
)

type Update struct {
	ModelID string `json:"modelID"`
	ViewID *string `json:"viewID"`
	Filter *map[string]interface{} `json:"filter"`
	List *[]map[string]interface{} `json:"list"`
	SelectedRowKeys *[]string `json:"selectedRowKeys"`
	AppDB string `json:"appDB"`
	UserID string `json:"userID"`
	UserRoles string `json:"userRoles"`
}

func (update *Update)getUpdateCommonFieldsValues()(string){
	now:=time.Now().Format("2006-01-02 15:04:05")
	commonValue:=CC_UPDATE_TIME+"='"+now+"',"+          //last_upate_time
				 CC_UPDATE_USER+"='"+update.UserID+"',"+  //last_update_user
				 CC_VERSION+"="+CC_VERSION+"+1"                  //version
	
	return commonValue
}

func (update *Update)isIgnoreFieldUpdate(field string)(bool){
	if field == SAVE_TYPE_COLUMN||
		field == CC_CREATE_TIME ||
		field == CC_CREATE_USER ||
		field == CC_UPDATE_TIME ||
		field == CC_UPDATE_USER ||
		field == CC_VERSION ||
		field == CC_ID {
		return true
	}
	return false
}

func (update *Update)getUpdateFilter()(*map[string]interface{}){
	if update.SelectedRowKeys != nil && len(*(update.SelectedRowKeys))>0 {
		return &map[string]interface{}{
					"id":map[string]interface{}{
						Op_in:*(update.SelectedRowKeys),
					},
				}
	}

	return update.Filter
}

func (update *Update)getUpdateWhere(permissionFilter,updateFilter *map[string]interface{})(string,int){
	if permissionFilter == nil {
		return FilterToSQLWhere(updateFilter)
	}

	if updateFilter == nil {
		return FilterToSQLWhere(permissionFilter)
	}

	filter:=&map[string]interface{}{
		Op_and:[]interface{}{
			*updateFilter,
			*permissionFilter,
		},
	}

	return FilterToSQLWhere(filter)
}

func (update *Update)getUpdateFields(permissionFields string)(string,int){
	//更新的数据放在List数组中，仅支持一行数据
	if update.List==nil||
		len(*(update.List)) == 0 {
		return "",common.ResultUpdateFieldNotFound
	}

	updateFields:=(*(update.List))[0]
	
	permissionFields=","+permissionFields+","

	updateFieldsStr:=""
	for key, value := range updateFields {
		//跳过操作类型字段和系统保留字段
		if update.isIgnoreFieldUpdate(key) {
			continue
		}

		//跳过没有权限的字段
		if !(permissionFields==",*," || strings.Contains(permissionFields,","+key+",")) {
			continue
		}

		//根据不同值类型做处理，目前仅支持字符串
		switch v := value.(type) {
		case string:
			sVal, _ := value.(string)
			updateFieldsStr=updateFieldsStr+key+"='"+sVal+"',"
		case map[string]interface{}:
			//这里udpate的时候实际上只支持many2one字段，目前many2one字段提交的时候是直接使用string类型传递的，所以这里只是提供一个校验
			releatedField,ok:=value.(map[string]interface{})
			if !ok {
				log.Println("getUpdateFields not supported value type %T!\n", v)
				return "",common.ResultNotSupportedValueType	
			}

			fieldType:=releatedField["fieldType"].(string)
			log.Println(fieldType)
			if fieldType!=FIELDTYPE_MANY2MANY&&
			   fieldType!=FIELDTYPE_ONE2MANY&&
			   fieldType!=FIELDTYPE_FILE {
				return "",common.ResultNotSupportedValueType	
			}
		case nil:
			updateFieldsStr=updateFieldsStr+key+"=null,"
		default:
			log.Println("getUpdateFields not supported value type %T!\n", v)
			return "",common.ResultNotSupportedValueType
		}
	}

	if len(updateFieldsStr)==0 {
		return "",common.ResultUpdateFieldNotFound
	}

	return updateFieldsStr,common.ResultSuccess
}

func (update *Update)update(dataRepository DataRepository,tx *sql.Tx)(*map[string]interface {},int){
	//获取数据操作权限
	permissionDataset,errorCode:=definition.GetUserDataset(update.AppDB,update.ModelID,update.UserRoles,definition.DATA_OP_TYPE_QUERY)
	if errorCode != common.ResultSuccess {
		return nil,errorCode
	}
	//获取更新数据的过滤条件
	updateFilter:=update.getUpdateFilter()
	//获取更新字段
	updateFieldsStr,errorCode:=update.getUpdateFields(permissionDataset.Fields)
	if errorCode != common.ResultSuccess {
		return nil,errorCode
	}
	
	updateFieldsStr=updateFieldsStr+update.getUpdateCommonFieldsValues()
	//过滤条件转换为sql where
	whereStr,errorCode:=update.getUpdateWhere(permissionDataset.Filter,updateFilter)
	if errorCode != common.ResultSuccess {
		return nil,errorCode
	}
	//拼接更新sql
	sql:="update "+update.AppDB+"."+update.ModelID+" set "+updateFieldsStr+" where "+whereStr
	//执行sql
	_,rowCount,err:=dataRepository.execWithTx(sql,tx)
	if err != nil {
		return nil,common.ResultSQLError
	}

	result := map[string]interface{}{}		
	result["count"]=rowCount
	result["modelID"]=update.ModelID
	return &result,common.ResultSuccess
}

func (update *Update) Execute(dataRepository DataRepository)(*map[string]interface {},int) {
	//开启事务
	tx,err:= dataRepository.begin()
	if err != nil {
		log.Println(err)
		return nil,common.ResultSQLError
	}
	//执行数据更新操作
	result,errorCode:=update.update(dataRepository,tx)
	if errorCode == common.ResultSuccess {
		//提交事务
		if err := tx.Commit(); err != nil {
			log.Println(err)
			errorCode=common.ResultSQLError
		}
	} else {
		tx.Rollback()
	}
	return result,errorCode
}