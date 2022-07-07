package data

import (
	"crv/frame/common"
	"crv/frame/definition"
	"log"
	"database/sql"
	"time"
	"strings"
	"strconv"
)

const (
	SAVE_TYPE_COLUMN = "_save_type"
	SAVE_CREATE = "create"
	SAVE_UPDATE = "update"
	SAVE_DELETE = "delete"

	CC_CREATE_TIME = "create_time"
	CC_CREATE_USER = "create_user"
	CC_UPDATE_TIME = "update_time"
	CC_UPDATE_USER = "update_user"
	CC_VERSION = "version"
	CC_ID = "id"
)

//save 操作将返回操作数据的ID列表，操作数据的行数
type saveResult struct {
	ModelID string `json:"modelID"`
	Total int `json:"total"`
	List []map[string]interface{} `json:"list"`
}

type Save struct {
	ModelID string `json:"modelID"`
	List *[]map[string]interface{} `json:"list"` 
	AppDB string `json:"appDB"`
	UserID string `json:"userID"`
	UserRoles string `json:"userRoles"`
}

func GetCreateCommonFieldsValues(userID string)(string,string){
	commonFields:=CC_CREATE_TIME+","+
	              CC_CREATE_USER+","+
				  CC_UPDATE_TIME+","+
				  CC_UPDATE_USER+","+
				  CC_VERSION

	now:=time.Now().Format("2006-01-02 15:04:05")
	commonValue:="'"+now+"',"+          //create_time
				"'"+userID+"',"+  //create_user
				"'"+now+"',"+          //last_upate_time
				"'"+userID+"',"+  //last_update_user
				"0"                    //version
	
	return commonFields,commonValue
}

func (save *Save)getUpdateCommonFieldsValues()(string){
	now:=time.Now().Format("2006-01-02 15:04:05")
	commonValue:=CC_UPDATE_TIME+"='"+now+"',"+          //last_upate_time
				 CC_UPDATE_USER+"='"+save.UserID+"',"+  //last_update_user
				 CC_VERSION+"="+CC_VERSION+"+1"                  //version
				 
	return commonValue
}

func (save *Save)isIgnoreFieldUpdate(field string)(bool){
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

func (save *Save)isIgnoreFieldCreate(field string)(bool){
	if field == SAVE_TYPE_COLUMN||
		field == CC_CREATE_TIME ||
		field == CC_CREATE_USER ||
		field == CC_UPDATE_TIME ||
		field == CC_UPDATE_USER ||
		field == CC_VERSION {
		return true
	}
	return false
}

func (save *Save)getRowUpdateColumnValues(row map[string]interface{},permissionFields string)(string,string,string,int){
	values:=""
	strID:=""
	version:=""
	permissionFields=","+permissionFields+","
	for key, value := range row {
		//对于version和id字段，只是取出值用于更新数据的where条件部分使用，其值不用于更新
		if key == CC_VERSION {
			version=value.(string)
		} else if key == CC_ID {
			strID=value.(string)
		}

		//跳过操作类型字段和系统保留字段
		if save.isIgnoreFieldUpdate(key) {
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
			values=values+key+"='"+sVal+"',"
		case map[string]interface{}:
			releatedField,ok:=value.(map[string]interface{})
			if !ok {
				log.Println("getRowUpdateColumnValues not supported value type %T!\n", v)
				return "","",version,common.ResultNotSupportedValueType	
			}

			fieldType:=releatedField["fieldType"].(string)
			log.Println(fieldType)
			if fieldType!=FIELDTYPE_MANY2MANY&&
			   fieldType!=FIELDTYPE_ONE2MANY&&
			   fieldType!=FIELDTYPE_FILE {
				return "","",version,common.ResultNotSupportedValueType	
			}
		case nil:
			values=values+key+"=null,"
		default:
			log.Println("getRowUpdateColumnValues not supported value type %T!\n", v)
			return "","",version,common.ResultNotSupportedValueType
		}
	}
	log.Println("version")
	log.Println(version)
	return values,strID,version,common.ResultSuccess
}

func (save *Save)getRowCreateColumnValues(row map[string]interface{})(string,string,string,int){
	columns:=""
	values:=""
	strID:=""
	for key, value := range row {
		//跳过操作类型字段和系统保留字段
		if save.isIgnoreFieldCreate(key) {
			continue
		}

		//根据不同值类型做处理，目前仅支持字符串
		switch v := value.(type) {
		case string:
			columns=columns+key+","
			sVal, _ := value.(string)
			values=values+"'"+sVal+"',"
			//如果提交的数据中本身携带了ID字段，则将其取出，后续将放在返回值中
			if key == CC_ID {
				strID=sVal
			}
		case map[string]interface{}:
			releatedField,ok:=value.(map[string]interface{})
			if !ok {
				log.Println("createRow not supported value type %T!\n", v)
				return "","","",common.ResultNotSupportedValueType	
			}

			fieldType:=releatedField["fieldType"].(string)
			log.Println(fieldType)
			if fieldType!=FIELDTYPE_MANY2MANY&&
			   fieldType!=FIELDTYPE_ONE2MANY&&
			   fieldType!=FIELDTYPE_FILE  {
				return "","","",common.ResultNotSupportedValueType	
			}
		default:
			log.Println("createRow not supported value type %T!\n", v)
			return "","","",common.ResultNotSupportedValueType
		}
	}
	return columns,values,strID,common.ResultSuccess
}

func (save *Save)saveRelatedField(pID string,dataRepository DataRepository,tx *sql.Tx,modelID string,row map[string]interface{})(int){
	log.Println("saveRelatedField ... ")
	for key, value := range row {
		//根据不同值类型做处理，目前仅支持字符串
		switch v := value.(type) {	
		case map[string]interface{}:
			releatedField,ok:=value.(map[string]interface{})
			if !ok {
				log.Println("createRow not supported value type %T!\n", v)
				return common.ResultNotSupportedValueType	
			}

			fieldType:=releatedField["fieldType"].(string)
			saver:=GetRelatedModelSaver(fieldType,save.AppDB,save.UserID,key,save.UserRoles)	
			
			if saver==nil {
				return common.ResultNotSupportedFieldType
			}

			errorCode:=saver.save(pID,dataRepository,tx,modelID,releatedField)
			if errorCode!=common.ResultSuccess {
				return errorCode
			}
		default:
		}
	}
	log.Println("saveRelatedField end ")
	return common.ResultSuccess
}

func (save *Save)createRow(
	dataRepository DataRepository,
	tx *sql.Tx,
	modelID string,
	row map[string]interface{},
	permissionDS *definition.Dataset)(map[string]interface{},int) {

	log.Println("start data save createRow")
	columns,values,strID,errCode:=save.getRowCreateColumnValues(row)
	if errCode!=common.ResultSuccess{
		return nil,errCode
	}
	
	commonFields,commonFieldsValue:=GetCreateCommonFieldsValues(save.UserID)
	columns=columns+commonFields
	values=values+commonFieldsValue
	sql:="insert into "+save.AppDB+"."+modelID+" ("+columns+") values ("+values+")"
	
	//执行sql
	id,_,err:=dataRepository.execWithTx(sql,tx)
	if err != nil {
		//判断，如果是Error 1062，则未主键冲突
		if strings.Contains(err.Error(),"Error 1062") {
			return nil,common.ResultDuplicatePrimaryKey
		}
		return nil,common.ResultSQLError
	}
	//获取最后插入数据的ID
	result := map[string]interface{}{}		
	if len(strID)>0 {
		result["id"]=strID
	} else {
		result["id"]=id
		strID=strconv.FormatInt(id,10)
	}

	errorCode:=save.saveRelatedField(strID,dataRepository,tx,modelID,row)
	log.Println("end data save createRow")
	return result,errorCode
}

func (save *Save) deleteRow(
	dataRepository DataRepository,
	tx *sql.Tx,
	modelID string,
	row map[string]interface{},
	permissionDS *definition.Dataset)(map[string]interface{},int) {

	rowID,ok:=row[CC_ID]
	if !ok {
		return nil,common.ResultNoIDWhenUpdate
	}

	strID, ok := rowID.(string)
	if !ok || len(strID)<=0 {
		return nil,common.ResultNoIDWhenUpdate
	}

	//删除用户有权限的数据
	permissionWhere:=""
	errorCode:=common.ResultSuccess
	if permissionDS.Filter !=nil {
		permissionWhere,errorCode=FilterToSQLWhere(permissionDS.Filter)
		if errorCode != common.ResultSuccess {
			return nil,errorCode
		}
		permissionWhere=" and ( "+permissionWhere+" )"
	}

	sql:="delete from "+save.AppDB+"."+modelID+" where id='"+strID+"'"+permissionWhere
	_,rowCount,err:=dataRepository.execWithTx(sql,tx)
	if err != nil {
		return nil,common.ResultSQLError
	}

	//没有删除数据的情况，可能是没有权限，也可能是本身就没有对应的数据
	if rowCount == 0 {
		return nil,common.ResultNotDeleteData
	}

	result := map[string]interface{}{}		
	result["id"]=strID

	//还要删掉和当前模型相关联的中间表的数据
	idList:=[]string{strID}
	dr:=DeleteReleated{
		ModelID:modelID,
		AppDB:save.AppDB,
		UserID:save.UserID,
		IdList:&idList,
	}
	errorCode=dr.Execute(dataRepository,tx)
	return result,errorCode
}

func (save *Save) updateRow(
	dataRepository DataRepository,
	tx *sql.Tx,
	modelID string,
	row map[string]interface{},
	permissionDS *definition.Dataset)(map[string]interface{},int) {

	values,strID,version,errCode:=save.getRowUpdateColumnValues(row,permissionDS.Fields)
	if errCode!=common.ResultSuccess{
		return nil,errCode
	}

	if len(strID)<=0 {
		return nil,common.ResultNoIDWhenUpdate
	} 

	if len(version)<=0 {
		return nil,common.ResultNoVersionWhenUpdate
	}

	//更新用户有权限的数据
	permissionWhere:=""
	if permissionDS.Filter !=nil {
		permissionWhere,errCode=FilterToSQLWhere(permissionDS.Filter)
		if errCode != common.ResultSuccess {
			return nil,errCode
		}
		permissionWhere=" and ( "+permissionWhere+" )"
	}

	values=values+save.getUpdateCommonFieldsValues()
	sql:="update "+save.AppDB+"."+modelID+" set "+values+" where id='"+strID+"' and version="+version+permissionWhere
	
	//执行sql
	_,rowCount,err:=dataRepository.execWithTx(sql,tx)
	if err != nil {
		return nil,common.ResultSQLError
	}

	//未能正确更新数据，一般是数据版本发生变更或者用户权限不对造成的
	if rowCount==0 {
		return nil,common.ResultWrongDataVersion
	}
	//获取最后插入数据的ID
	result := map[string]interface{}{}
	//if len(strID)>0 {
		result["id"]=strID
	//} else {
	//	result["id"]=id
	//	strID=strconv.FormatInt(id,10)
	//}

	errorCode:=save.saveRelatedField(strID,dataRepository,tx,modelID,row)
	return result,errorCode
}

func (save *Save) saveRow(
	dataRepository DataRepository,
	tx *sql.Tx,
	modelID string,
	row map[string]interface{},
	permissionDS *definition.Dataset)(map[string]interface{},int) {
	
	saveType:=row[SAVE_TYPE_COLUMN]
	switch saveType {
		case SAVE_CREATE:
			return save.createRow(dataRepository,tx,modelID,row,permissionDS)
		case SAVE_DELETE:
			return save.deleteRow(dataRepository,tx,modelID,row,permissionDS)
		case SAVE_UPDATE:
			return save.updateRow(dataRepository,tx,modelID,row,permissionDS)
		//case nil:
		//	return save.getNilOperationRowResult(row,permissionDS)
		default:
			return nil,common.ResultNotSupportedSaveType
	}
}

func (save *Save) SaveList(dataRepository DataRepository,tx *sql.Tx)(*saveResult,int) {
	log.Println("start data save SaveList")
	//循环执行每个行
	if len(*save.List) == 0 {
		result:=&saveResult{
			ModelID:save.ModelID,
			Total:0,
			List:[]map[string]interface{}{},
		}
		return result,common.ResultSuccess
	}

	//获取用户权限
	permissionDataset,errorCode:=definition.GetUserDataset(save.AppDB,save.ModelID,save.UserRoles,definition.DATA_OP_TYPE_MUTATION)
	if errorCode != common.ResultSuccess {
		return nil,errorCode
	}

	var total int = 0
	var resList []map[string]interface{}
	for _, row := range *(save.List) {
		res,errorCode:=save.saveRow(dataRepository, tx, save.ModelID, row,permissionDataset)
		if errorCode == common.ResultSuccess {
			//每一行的结果加入到数组中
			resList=append(resList,res)
			total++
		} else {
			return nil,errorCode
		}
	}
	result:=&saveResult{
		ModelID:save.ModelID,
		Total:total,
		List:resList,
	}
	log.Println("end data save SaveList")
	return result,common.ResultSuccess
}

func (save *Save) Execute(dataRepository DataRepository)(*saveResult,int) {
	log.Println("start data save Execute")
	
	//开启事务
	tx,err:= dataRepository.begin()
	if err != nil {
		log.Println(err)
		return nil,common.ResultSQLError
	}
	//执行保存动作
	result,errorCode:=save.SaveList(dataRepository,tx)
	if errorCode == common.ResultSuccess {
		//提交事务
		if err := tx.Commit(); err != nil {
			log.Println(err)
			errorCode=common.ResultSQLError
		}
	} else {
		tx.Rollback()
	}
	log.Println("end data save Execute")
	return result,errorCode
}

