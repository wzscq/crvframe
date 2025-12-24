package data

import (
	"crv/frame/common"
	"fmt"
	"log/slog"
	"reflect"
	"strconv"
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
	Op_and        = "Op.and"
	Op_or         = "Op.or"
	Op_eq         = "Op.eq"
	Op_ne         = "Op.ne"
	Op_is         = "Op.is"
	Op_not        = "Op.not"
	Op_gt         = "Op.gt"
	Op_gte        = "Op.gte"
	Op_lt         = "Op.lt"
	Op_lte        = "Op.lte"
	Op_between    = "Op.between"
	Op_notBetween = "Op.notBetween"
	Op_like       = "Op.like"
	Op_in         = "Op.in"
	Op_notIn      = "Op.notIn"
)

/*
过滤条件第一层的解析
第一层是一个对象，KEY值中允许包含：
字段，直接对字段值做过滤
逻辑操作符，and or
第一层中的不同key值间的逻辑关系是and
*/
func FilterToSQLWhere(filter *map[string]interface{}, fields *[]Field, modelID string) (string, int) {
	return convertObjectFilter(filter, fields, modelID)
}

func convertObjectFilter(filter *map[string]interface{}, fields *[]Field, modelID string) (string, int) {
	var str string
	var err int
	var where string
	if filter != nil {
		for key, value := range *filter {
			switch key {
			case Op_or:
				mVal, _ := value.([]interface{})
				slog.Debug("convertObjectFilter", "key",key,"value", value)
				str, err = convertArrayFilter("or", mVal, fields, modelID)
			case Op_and:
				slog.Debug("convertObjectFilter", "key",key,"value", value)
				mVal, _ := value.([]interface{})
				str, err = convertArrayFilter("and", mVal, fields, modelID)
			default:
				slog.Debug("convertObjectFilter", "key",key,"value", value)
				//字段
				str, err = convertFieldFilter(key, value, fields, modelID)
			}

			if err != common.ResultSuccess {
				return "", err
			}

			where = where + " (" + str + ") and"
		}
	}

	if len(where) > 0 {
		where = where[0 : len(where)-3]
	} else {
		where = "1=1"
	}
	return where, common.ResultSuccess
}

func convertArrayFilter(logicOp string, value []interface{}, fields *[]Field, modelID string) (string, int) {

	slog.Debug("convertArrayFilter", "logicOp",logicOp,"value", value)
	if len(value) == 0 {
		return "", common.ResultQueryWrongFilter
	}

	var where string = ""
	var str string
	var err int
	for _, v := range value {
		//每个行应该是一个对象
		mVal, _ := v.(map[string]interface{})
		slog.Debug("convertArrayFilter", "mVal", mVal)
		str, err = convertObjectFilter(&mVal, fields, modelID)
		slog.Debug("convertArrayFilter", "str", str)
		if err != common.ResultSuccess {
			return "", err
		}
		where = where + " (" + str + ") " + logicOp
	}

	where = where[0 : len(where)-len(logicOp)]

	return where, common.ResultSuccess
}

/*
字段类型值的过滤，字段值有三种类型的过滤条件
{fieldname:value}  =>  fieldname=value  //直接给值，相当与Op.eq操作符
{fieldname:[val1,val2]} => fieldname in (val1,val2)  //数据，相当于Op.in操作符
{fieldname:{Op.gt,value}} => filename > value  //明确给出操作符，按照操作符来解析
*/
func convertFieldFilter(field string, value interface{}, fields *[]Field, modelID string) (string, int) {
	switch value.(type) {
	case string:
		sVal, _ := value.(string)
		return convertFieldValueString(" like ", field, sVal)
	case float64:
		fVal, _ := value.(float64)
		sVal := fmt.Sprintf("%f", fVal)
		return convertFieldValueString(" = ", field, sVal)
	case int64:
		iVal, _ := value.(int64)
		sVal := fmt.Sprintf("%d", iVal)
		return convertFieldValueString(" = ", field, sVal)
	case map[string]interface{}:
		mVal, _ := value.(map[string]interface{})
		return convertFieldValueMap(field, mVal, fields, modelID)
	case nil:
		return convertFieldValueNull(" is ", field)
	default:
		slog.Error("convertFieldFilter not supported field filter type", "type", reflect.TypeOf(value))
		return "", common.ResultNotSupported
	}
}

func convertFieldValueNull(op string, field string) (string, int) {
	return field + op + " null ", common.ResultSuccess
}

func convertFieldValueString(op string, field string, value string) (string, int) {
	if op == " like " {
		value = "%" + value + "%"
	}
	return field + op + "'" + replaceApostrophe(value) + "'", common.ResultSuccess
}

func convertFieldValueStringArray(op string, field string, sliceVal []string) (string, int) {
	slog.Debug("convertFieldValueStringArray", "op", op, "field", field, "sliceVal", sliceVal)
	values := ""
	for _, sVal := range sliceVal {
		values = values + "'" + replaceApostrophe(sVal) + "',"
	}
	values = values[0 : len(values)-1]
	return field + op + "(" + values + ")", common.ResultSuccess
}

func convertFieldValueArray(op string, field string, sliceVal []interface{}) (string, int) {
	values := ""
	for _, val := range sliceVal {
		slog.Debug("convertFieldValueArray val type", "val type", reflect.TypeOf(val))

		switch val.(type) {
		case string:
			sVal, _ := val.(string)
			values = values + "'" + replaceApostrophe(sVal) + "',"
		case float64:
			f64Val, _ := val.(float64)
			sVal := strconv.FormatFloat(f64Val, 'f', -1, 64)
			values = values + sVal + ","
		}
	}

	if len(values) > 1 {
		values = values[0 : len(values)-1]
	}
	return field + op + "(" + values + ")", common.ResultSuccess
}

func joinSlice(sliceVal []interface{}, split string) string {
	values := ""
	for _, val := range sliceVal {
		slog.Debug("joinSlice val type", "val type", reflect.TypeOf(val))

		switch val.(type) {
		case string:
			sVal, _ := val.(string)
			values = values + "'" + replaceApostrophe(sVal) + "',"
		case float64:
			f64Val, _ := val.(float64)
			sVal := strconv.FormatFloat(f64Val, 'f', -1, 64)
			values = values + sVal + ","
		}
	}

	if len(values) > 1 {
		values = values[0 : len(values)-1]
	}

	return values
}

func convertFieldOpNormal(op string, field string, value interface{}) (string, int) {
	switch value.(type) {
	case string:
		sVal, _ := value.(string)
		return convertFieldValueString(op, field, sVal)
	case []string:
		sliceVal := value.([]string)
		return convertFieldValueStringArray(op, field, sliceVal)
	case int64:
		iVal, _ := value.(int64)
		sVal := fmt.Sprintf("%d", iVal)
		return convertFieldValueString(op, field, sVal)
	case float64:
		fVal, _ := value.(float64)
		sVal := fmt.Sprintf("%f", fVal)
		return convertFieldValueString(op, field, sVal)
	case []interface{}:
		sliceVal := value.([]interface{})
		return convertFieldValueArray(op, field, sliceVal)
	case nil:
		return convertFieldValueNull(op, field)
	default:
		slog.Error("convertFieldOpNormal not supported operator with value type", "op", op, "val type", reflect.TypeOf(value))
		return "", common.ResultNotSupported
	}
}

func convertOpInString(op string, field string, value string) (string, int) {
	return field + " in (" + value + ") ", common.ResultSuccess
}

func convertMany2manyValue(modelID string, field *Field, value interface{}) (string, int) {
	if field.RelatedModelID == nil {
		slog.Error("convertMany2manyValue the many2many field has not related model id", "field", field.Field)
		return "", common.ResultNoRelatedModel
	}

	var sVal string
	switch value.(type) {
	case []string:
	case []interface{}:
		sliceVal := value.([]interface{})
		sVal = joinSlice(sliceVal, ",")
	default:
		slog.Error("convertMany2manyValue not supported value type", "val type", reflect.TypeOf(value))
		return "", common.ResultNotSupported
	}

	//const subSelect='select '+modelID+"_id as id from "+getAssociationModelID(modelID,fieldConf.relatedModelID)+" where "+fieldConf.relatedModelID+"_id in ('"+filterValue.join("','")+"')
	associationModelID := getRelatedModelID(modelID, *field.RelatedModelID, field.AssociationModelID)
	subSelect := "select " + modelID + "_id as id from " + associationModelID + " where " + *field.RelatedModelID + "_id in (" + sVal + ")"
	return subSelect, common.ResultSuccess
}

func convertFieldOpIn(op string, field string, value interface{}, fields *[]Field, modelID string) (string, int) {
	slog.Debug("convertFieldOpIn ", "field", field, "val type", reflect.TypeOf(value),"value",value,"modelID",modelID)

	//查看当前字段是否是many2many字段
	if fields != nil {
		for _, fieldItem := range *fields {
			if fieldItem.Field == field && fieldItem.FieldType != nil && *fieldItem.FieldType == FIELDTYPE_MANY2MANY {
				//对字段的值做转换，改为一个子查询字符串
				var err int
				value, err = convertMany2manyValue(modelID, &fieldItem, value)
				if err != common.ResultSuccess {
					return "", err
				}
				field = "id"
			}

			if fieldItem.Field == field && fieldItem.FieldType != nil && *fieldItem.FieldType == FIELDTYPE_ONE2MANY {
				//对字段的值做转换，改为一个in查询
				//一对多虚拟字段，转换为对ID的过滤
				field = "id"
			}
		}
	}

	slog.Debug("convertFieldOpIn ", "field", field, "val type", reflect.TypeOf(value),"value",value,"modelID",modelID)

	switch value.(type) {
	case string:
		sVal := value.(string)
		return convertOpInString(op, field, sVal)
	case []string:
		sliceVal := value.([]string)
		return convertFieldValueStringArray(op, field, sliceVal)
	case []interface{}:
		sliceVal := value.([]interface{})
		return convertFieldValueArray(op, field, sliceVal)
	default:
		slog.Error("convertFieldOpIn not supported operator with value type", "op", op, "val type", reflect.TypeOf(value))
		return "", common.ResultNotSupported
	}
}

func convertFieldValueMap(field string, value map[string]interface{}, fields *[]Field, modelID string) (string, int) {
	var where string
	var str string
	var err int
	var index int = 0


	for key, value := range value {
		switch key {
		case Op_eq:
			str, err = convertFieldOpNormal(" = ", field, value)
		case Op_ne:
			str, err = convertFieldOpNormal(" <> ", field, value)
		case Op_gt:
			str, err = convertFieldOpNormal(" > ", field, value)
		case Op_lt:
			str, err = convertFieldOpNormal(" < ", field, value)
		case Op_gte:
			str, err = convertFieldOpNormal(" >= ", field, value)
		case Op_lte:
			str, err = convertFieldOpNormal(" <= ", field, value)
		case Op_in:
			str, err = convertFieldOpIn(" in ", field, value, fields, modelID)
		case Op_is:
			str, err = convertFieldOpNormal(" is ", field, nil)
		case Op_not:
			str, err = convertFieldOpNormal(" is not ", field, nil)
		case Op_like:
			str, err = convertFieldOpNormal(" like ", field, value)
		default:
			//字段
			slog.Error("convertFieldValueMap not supported operator type", "operator type", key)
			return "", common.ResultNotSupported
		}

		if err != common.ResultSuccess {
			return "", err
		}

		if index == 0 {
			where = str
		} else {
			where = where + " and " + str
		}

		index++
	}
	return where, common.ResultSuccess
}
