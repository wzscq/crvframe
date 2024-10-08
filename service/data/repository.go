package data

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"log/slog"
	"time"
	"fmt"
	"strings"
)

type DataRepository interface {
	Begin() (*sql.Tx, error)
	Query(sql string) ([]map[string]interface{}, error)
	ExecWithTx(sql string, tx *sql.Tx) (int64, int64, error)
}

type DefatultDataRepository struct {
	DB *sql.DB
}

func (repo *DefatultDataRepository) Begin() (*sql.Tx, error) {
	return repo.DB.Begin()
}

func (repo *DefatultDataRepository) ExecWithTx(sql string, tx *sql.Tx) (int64, int64, error) {
	//替换sql语句中的转义字符
	sql = strings.Replace(sql, "\\", "\\\\", -1) // -1 表示替换所有匹配项
	slog.Info(sql)
	res, err := tx.Exec(sql)
	if err != nil {
		slog.Error(err.Error())
		return 0, 0, err
	}

	rowCount, err := res.RowsAffected()
	if err != nil {
		slog.Error(err.Error())
		return 0, 0, err
	}

	//获取最后插入数据的ID
	id, err := res.LastInsertId()
	if err != nil {
		slog.Error(err.Error())
		return 0, 0, err
	}

	return id, rowCount, nil
}

func (repo *DefatultDataRepository) rowsToMap(rows *sql.Rows) ([]map[string]interface{}, error) {
	cols, _ := rows.Columns()
	columns := make([]interface{}, len(cols))
	colPointers := make([]interface{}, len(cols))
	for i, _ := range columns {
		colPointers[i] = &columns[i]
	}

	var list []map[string]interface{}
	for rows.Next() {
		err := rows.Scan(colPointers...)
		if err != nil {
			slog.Error(err.Error())
			return nil, err
		}
		row := make(map[string]interface{})
		for i, colName := range cols {
			val := colPointers[i].(*interface{})
			switch (*val).(type) {
			case []byte:
				row[colName] = string((*val).([]byte))
			default:
				row[colName] = *val
			}
		}
		list = append(list, row)
	}
	return list, nil
}

func (repo *DefatultDataRepository) Query(sql string) ([]map[string]interface{}, error) {
	slog.Info(sql)
	rows, err := repo.DB.Query(sql)
	if err != nil {
		slog.Error(err.Error())
		return nil, err
	}
	defer rows.Close()
	//结果转换为map
	return repo.rowsToMap(rows)
}

func (repo *DefatultDataRepository) Connect(
	server, user, password, dbName string,
	connMaxLifetime, maxOpenConns, maxIdleConns int,tls string) {
	// Capture connection properties.
	/*cfg := mysql.Config{
		User:                 user,
		Passwd:               password,
		Net:                  "tcp",
		Addr:                 server,
		DBName:               dbName,
		AllowNativePasswords: true,
		TLS:                  tls,
	}*/
	dsn:=fmt.Sprintf("%s:%s@tcp(%s)/%s?allowNativePasswords=true&tls=%s",user,password,server,dbName,tls)
	slog.Info("connect to mysql server","dsn",dsn)
	var err error
	repo.DB, err = sql.Open("mysql", dsn)
	if err != nil {
		slog.Error(err.Error())
	}

	pingErr := repo.DB.Ping()
	if pingErr != nil {
		slog.Error(pingErr.Error())
	}
	repo.DB.SetConnMaxLifetime(time.Minute * time.Duration(connMaxLifetime))
	repo.DB.SetMaxOpenConns(maxOpenConns)
	repo.DB.SetMaxIdleConns(maxIdleConns)
	slog.Info("connect to mysql server " + server)
}
