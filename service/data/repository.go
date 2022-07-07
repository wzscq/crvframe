package data

import (
	"database/sql"
	"github.com/go-sql-driver/mysql"
	"log"
)

type DataRepository interface {
	begin() (*sql.Tx, error)
	query(sql string)([]map[string]interface{},error)
	execWithTx(sql string,tx *sql.Tx)(int64,int64, error)
}

type DefatultDataRepository struct {
	DB *sql.DB
}

func (repo *DefatultDataRepository)begin()(*sql.Tx, error){
	return repo.DB.Begin()
}

func (repo *DefatultDataRepository)execWithTx(sql string,tx *sql.Tx)(int64,int64, error){
	log.Println(sql)
	res,err:=tx.Exec(sql)
	if err!=nil {
		log.Println(err)
		return 0,0,err
	}

	rowCount,err:=res.RowsAffected()
	if err!=nil {
		log.Println(err)
		return 0,0,err 
	}

	//获取最后插入数据的ID	
	id,err:=res.LastInsertId()
	if err!=nil {
		log.Println(err)
		return 0,0,err 
	}
		
	return id,rowCount,nil
}

func (repo *DefatultDataRepository)rowsToMap(rows *sql.Rows)([]map[string]interface{},error){
	cols,_:=rows.Columns()
	columns:=make([]interface{},len(cols))
	colPointers:=make([]interface{},len(cols))
	for i,_:=range columns {
		colPointers[i] = &columns[i]
	}

	var list []map[string]interface{}
	for rows.Next() {
		err:= rows.Scan(colPointers...)
		if err != nil {
			log.Println(err)
			return nil,err
		}
		row:=make(map[string]interface{})
		for i,colName :=range cols {
			val:=colPointers[i].(*interface{})
			switch (*val).(type) {
			case []byte:
				row[colName]=string((*val).([]byte))
			default:
				row[colName]=*val
			} 
		}
		list=append(list,row)
	}
	return list,nil
}

func (repo *DefatultDataRepository)query(sql string)([]map[string]interface{},error){
	log.Println(sql)
	rows, err := repo.DB.Query(sql)
	if err != nil {
		log.Println(err)
		log.Println(sql)
		return nil,err
	}
	defer rows.Close()
	//结果转换为map
	return repo.rowsToMap(rows)
}

func (repo *DefatultDataRepository)Connect(server string,user string,password string,dbName string){
	// Capture connection properties.
    cfg := mysql.Config{
        User:   user,
        Passwd: password,
        Net:    "tcp",
        Addr:   server,
        DBName: dbName,
		AllowNativePasswords:true,
    }
    // Get a database handle.
    var err error
    repo.DB, err = sql.Open("mysql", cfg.FormatDSN())
    if err != nil {
        log.Fatal(err)
    }

    pingErr := repo.DB.Ping()
    if pingErr != nil {
        log.Fatal(pingErr)
    }
    log.Println("connect to mysql server "+server)
}

