package operationlog

import (
	"database/sql"
	"github.com/go-sql-driver/mysql"
	"log"
	"time"
)

type OperationLog struct {
	OperationType string
	SourceType string
	IP string
	Result string
	CreateTime string
	CreateUser string
	UpdateTime string
	UpdateUser string
}

type OperationLogRepository interface {
	CreateOperationLog(appDB string,operationLog OperationLog)
}

type DefatultOperationLogRepository struct {
	DB *sql.DB
}

func (repo *DefatultOperationLogRepository)CreateOperationLog(appDB string,operationLog OperationLog){
	repo.DB.Exec(
		"insert into "+appDB+".core_operaion_log(operation_type,source_type,ip,result,create_time,create_user,update_time,update_user) values(?,?,?,?,?,?,?,?)",
		operationLog.OperationType,
		operationLog.SourceType,
		operationLog.IP,
		operationLog.Result,
		operationLog.CreateTime,
		operationLog.CreateUser,
		operationLog.UpdateTime,
		operationLog.UpdateUser)
}

func (repo *DefatultOperationLogRepository)Connect(
	server,user,password,dbName string,
	connMaxLifetime,maxOpenConns,maxIdleConns int){
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

		repo.DB.SetConnMaxLifetime(time.Minute * time.Duration(connMaxLifetime))
		repo.DB.SetMaxOpenConns(maxOpenConns)
		repo.DB.SetMaxIdleConns(maxIdleConns)
    log.Println("connect to mysql server "+server)
}