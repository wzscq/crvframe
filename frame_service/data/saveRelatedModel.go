package data

import (
	"database/sql"
)

type SaveRelatedModel interface {
	save(pID string,dataRepository DataRepository,tx *sql.Tx,modelID string,fieldValue map[string]interface{})(int)
}

func GetRelatedModelSaver(fieldType string,appDB string,userID string,fieldName string,userRoles string)(SaveRelatedModel){
	if fieldType ==FIELDTYPE_MANY2MANY {
		return &SaveManyToMany{
			AppDB:appDB,
			UserID:userID,
		}
	} else if fieldType == FIELDTYPE_FILE {
		return &SaveFile{
			AppDB:appDB,
			UserID:userID,
			FieldName:fieldName,
		}
	} else if fieldType ==FIELDTYPE_ONE2MANY {
		return &SaveOneToMany{
			AppDB:appDB,
			UserID:userID,
			UserRoles:userRoles,
		}
	} 
	
	return nil
}