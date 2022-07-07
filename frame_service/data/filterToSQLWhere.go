package data

import (
    "log"
    "crv/frame/common"
)

/**
过滤条件的配置方式参考了sequelize框架的格式，具体可参考网址：https://sequelize.org/v7/manual/model-querying-basics.html
以下为全部语法格式，这里不是所有的都支持了，需要逐步完善
{
    [Op.and]: [{ a: 5 }, { b: 6 }],            // (a = 5) AND (b = 6)
    [Op.or]: [{ a: 5 }, { b: 6 }],             // (a = 5) OR (b = 6)
    filename: {
      // Basics
      [Op.eq]: 3,                              // = 3
      [Op.ne]: 20,                             // != 20
      [Op.is]: null,                           // IS NULL
      [Op.not]: true,                          // IS NOT TRUE
      [Op.or]: [5, 6],                         // (someAttribute = 5) OR (someAttribute = 6)

      // Using dialect specific column identifiers (PG in the following example):
      [Op.col]: 'user.organization_id',        // = "user"."organization_id"

      // Number comparisons
      [Op.gt]: 6,                              // > 6
      [Op.gte]: 6,                             // >= 6
      [Op.lt]: 10,                             // < 10
      [Op.lte]: 10,                            // <= 10
      [Op.between]: [6, 10],                   // BETWEEN 6 AND 10
      [Op.notBetween]: [11, 15],               // NOT BETWEEN 11 AND 15

      // Other operators

      [Op.all]: sequelize.literal('SELECT 1'), // > ALL (SELECT 1)

      [Op.in]: [1, 2],                         // IN [1, 2]
      [Op.notIn]: [1, 2],                      // NOT IN [1, 2]

      [Op.like]: '%hat',                       // LIKE '%hat'
      [Op.notLike]: '%hat',                    // NOT LIKE '%hat'
      [Op.startsWith]: 'hat',                  // LIKE 'hat%'
      [Op.endsWith]: 'hat',                    // LIKE '%hat'
      [Op.substring]: 'hat',                   // LIKE '%hat%'
      [Op.iLike]: '%hat',                      // ILIKE '%hat' (case insensitive) (PG only)
      [Op.notILike]: '%hat',                   // NOT ILIKE '%hat'  (PG only)
      [Op.regexp]: '^[h|a|t]',                 // REGEXP/~ '^[h|a|t]' (MySQL/PG only)
      [Op.notRegexp]: '^[h|a|t]',              // NOT REGEXP/!~ '^[h|a|t]' (MySQL/PG only)
      [Op.iRegexp]: '^[h|a|t]',                // ~* '^[h|a|t]' (PG only)
      [Op.notIRegexp]: '^[h|a|t]',             // !~* '^[h|a|t]' (PG only)

      [Op.any]: [2, 3],                        // ANY ARRAY[2, 3]::INTEGER (PG only)
      [Op.match]: Sequelize.fn('to_tsquery', 'fat & rat') // match text search for strings 'fat' and 'rat' (PG only)

      // In Postgres, Op.like/Op.iLike/Op.notLike can be combined to Op.any:
      [Op.like]: { [Op.any]: ['cat', 'hat'] }  // LIKE ANY ARRAY['cat', 'hat']
	}
*/

const (
	Op_and = "Op.and"
	Op_or  = "Op.or"
	Op_eq  = "Op.eq"
	Op_is  = "Op.is"
    Op_not = "Op.not"
    Op_gt  = "Op.gt"
    Op_gte = "Op.gte"
    Op_lt  = "Op.lt"
    Op_lte = "Op.lte"
    Op_between = "Op.between"
	Op_notBetween = "Op.notBetween" 
	Op_like = "Op.like"
	Op_in = "Op.in"
    Op_notIn = "Op.notIn"
)

/*
过滤条件第一层的解析
第一层是一个对象，KEY值中允许包含：
字段，直接对字段值做过滤
逻辑操作符，and or
第一层中的不同key值间的逻辑关系是and
*/
func FilterToSQLWhere(filter *map[string]interface{})(string,int) {
    return convertObjectFilter(filter)
}

func convertObjectFilter(filter *map[string]interface{})(string,int){
    var str string
    var err int
    var where string
    if filter != nil {
        for key, value := range *filter {    
            log.Printf("convertObjectFilter key %s \n", key)  
            switch key {
            case Op_or:
                log.Println("value type %T",value)
                mVal,err1:=value.([]interface{})
                log.Println("error:%b",err1)
                str,err=convertArrayFilter("or",mVal)
            case Op_and:
                log.Println("value type %T",value)
                mVal,err1:=value.([]interface{})
                log.Println("error:%b",err1)
                str,err=convertArrayFilter("and",mVal)
            default:
                //字段
                str,err=convertFieldFilter(key,value)
            }

            if err != common.ResultSuccess {
                return "",err
            }

            where=where+" ("+str+") and"
        }
    }
    
    if len(where)>0 {
        where=where[0:len(where)-3]
    } else {
        where="1=1"
    }
    return where,common.ResultSuccess
}

func convertArrayFilter(logicOp string,value []interface{})(string,int){

    log.Println(value)
    if len(value) == 0 {
		return "",common.ResultQueryWrongFilter
	}

    var where string = ""
    var str string
    var err int
	for _, v := range value {
        //每个行应该是一个对象
        mVal,_:=v.(map[string]interface{})
        str,err=convertObjectFilter(&mVal)
        if err != common.ResultSuccess {
            return "",err
        }
        where=where+" ("+str+") "+logicOp
	}

	where=where[0:len(where)-len(logicOp)]

    return where,common.ResultSuccess
}
/*
字段类型值的过滤，字段值有三种类型的过滤条件
{fieldname:value}  =>  fieldname=value  //直接给值，相当与Op.eq操作符
{fieldname:[val1,val2]} => fieldname in (val1,val2)  //数据，相当于Op.in操作符
{fieldname:{Op.gt,value}} => filename > value  //明确给出操作符，按照操作符来解析 
*/
func convertFieldFilter(field string,value interface{})(string,int){
    switch v := value.(type) {
	case string:
        sVal, _ := value.(string)
		return convertFieldValueString(" like ",field,sVal)
    case map[string]interface{}:
        mVal,_:=value.(map[string]interface{})
        return convertFieldValueMap(field,mVal)
	default:
        log.Println("convertFieldFilter not supported field filter type %T!\n", v)
		return "",common.ResultNotSupported
	}
}

func convertFieldValueString(op string,field string,value string)(string,int){
    return field+op+"'"+value+"'",common.ResultSuccess        
}

func convertFieldValueStringArray(op string,field string,sliceVal []string)(string,int){
    values:=""
    for _,sVal:=range sliceVal {
        values=values+"'"+sVal+"',"
    }
    values=values[0:len(values)-1]
    return field+op+"("+values+")",common.ResultSuccess        
}

func convertFieldOpNormal(op string,field string,value interface{})(string,int){
    switch v := value.(type) {
	case string:
        sVal, _ := value.(string)
		return convertFieldValueString(op,field,sVal)
    case []string:
        sliceVal:=value.([]string)
        return convertFieldValueStringArray(op,field,sliceVal)    
    default:
        log.Println("convertFieldOpNormal not supported operator %v with value type %v \n",op,v)
		return "",common.ResultNotSupported
	}
}

func convertFieldValueMap(field string,value map[string]interface{})(string,int){
    var where string
    var str string
    var err int
    var index int = 0
    for key, value := range value {      
        switch key {
        case Op_eq:
            str,err=convertFieldOpNormal(" = ",field,value)
        case Op_gt:
            str,err=convertFieldOpNormal(" > ",field,value)
        case Op_lt:
            str,err=convertFieldOpNormal(" < ",field,value)
        case Op_in:
            str,err=convertFieldOpNormal(" in ",field,value)
        default:
            //字段
            log.Println("convertFieldValueMap not supported operator type %v \n", key)
		    return "",common.ResultNotSupported
        }

        if err != common.ResultSuccess {
            return "",err
        }

        if index == 0 {
            where = str
        } else {
            where = where + " and " + str 
        }
    }         
    return where,common.ResultSuccess
}