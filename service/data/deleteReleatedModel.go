package data

import (
	"crv/frame/common"
	"crv/frame/definition"
	"log"
	"database/sql"
	"strings"
	"os"
)

type DeleteReleated struct {
	ModelID string 
	IdList *[]string 
	AppDB string 
	UserID string
}

func (dr *DeleteReleated)deleteFile(dataRepository DataRepository,tx *sql.Tx)(int){
	ids:=dr.getIds()
	where:="model_id='"+dr.ModelID+"' and row_id in ("+ids+")"
	sql:="delete from "+dr.AppDB+".core_file where "+where
	//执行sql
	_,_,err:=dataRepository.execWithTx(sql,tx)
	if err != nil {
		log.Println("deleteFile execWithTx error:", err)
		return common.ResultSQLError
	}

	//删除文件
	path:=common.GetConfig().File.Root+"/"+dr.AppDB+"/"+dr.ModelID+"/"
	files, err := os.ReadDir(path)
	if err!=nil {
		log.Println("deleteFile ReadDir error:", err)
		//return common.ResultReadDirError
		//如果文件夹不存在说明没有对应的相关文件，不需要返回错误
		return common.ResultSuccess
	}

	for _, file := range files {
		fileName:=file.Name()
		log.Println(fileName)
		for _,strID:=range *(dr.IdList) {
			if strings.Index(fileName,"_row"+strID+"_")>0 {
				os.Remove(path+fileName)
			}
		}
	}
	return common.ResultSuccess
}

func (dr *DeleteReleated)deleteManyToMany(
	dataRepository DataRepository,
	tx *sql.Tx,
	relatedModelID string,
	associationModelID *string)(int){
	
	midModelID:=getRelatedModelID(dr.ModelID,relatedModelID,associationModelID)
	ids:=dr.getIds()
	where:=dr.ModelID+"_id in ("+ids+")"
	sql:="delete from "+dr.AppDB+"."+midModelID+" where "+where
	//执行sql
	_,_,err:=dataRepository.execWithTx(sql,tx)
	if err != nil {
		return common.ResultSQLError
	}
	return common.ResultSuccess
}

func (dr *DeleteReleated)getIds()(string){
	ids:=""
	for _,strID:=range *(dr.IdList) {
		ids=ids+"'"+strID+"',"
	}
	ids=ids[0:len(ids)-1]
	return ids
}

func (dr *DeleteReleated)Execute(dataRepository DataRepository,tx *sql.Tx)(int) {
	log.Println("DeleteReleated Execute")
	//加载当前模型配置
	modelConfig,errorCode:=definition.GetModelConf(dr.AppDB,dr.ModelID)
	if errorCode != common.ResultSuccess {
		return errorCode
	}

	for _,field:=range modelConfig.Fields {
		if field.FieldType==nil {
			continue
		}

		if *(field.FieldType)==FIELDTYPE_MANY2MANY {
			if field.RelatedModelID==nil {
				return common.ResultNoRelatedModel
			}
			errorCode:=dr.deleteManyToMany(dataRepository,tx,*(field.RelatedModelID),field.AssociationModelID)
			if errorCode!=common.ResultSuccess {
				return errorCode
			}
		} else if *(field.FieldType)==FIELDTYPE_ONE2MANY {
			
		} else if *(field.FieldType)==FIELDTYPE_FILE {
			errorCode:=dr.deleteFile(dataRepository,tx)
			if errorCode!=common.ResultSuccess {
				return errorCode
			}
		}
	}

	return common.ResultSuccess
}

