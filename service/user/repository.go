package user

import (
	"database/sql"
	"github.com/go-sql-driver/mysql"
	"log"
	"time"
)

type User struct {
	UserID string
	UserNameEn *string
	UserNameZh *string
	Password string
	CreateTime string
	CreateUser string
	UpdateTime string
	UpdateUser string
	Remark *string
}

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

type UserRepository interface {
	GetUser(userID string,dbName string)(*User,error)
	updatePassword(userID string,password string,dbName string)(error)
	GetUserRoles(userID string,dbName string)(string,error)
	CreateOperationLog(dbName string,operationLog OperationLog)
}

type DefatultUserRepository struct {
	DB *sql.DB
}

func (repo *DefatultUserRepository)GetUser(userID string,dbName string)(*User,error){
	var user User
	row := repo.DB.QueryRow("select id as user_id,user_name_en,user_name_zh,password from "+dbName+".core_user WHERE id = ?", userID)
    if err := row.Scan(&user.UserID, &user.UserNameEn, &user.UserNameZh, &user.Password); err != nil {
        log.Println("get user error")
		log.Println(err)
        return &user, err
    }
	return &user, nil
}

func (repo *DefatultUserRepository)updatePassword(userID string,password string,dbName string)(error){
	_, err := repo.DB.Exec("update "+dbName+".core_user set password=? where id = ?", password,userID)
	return err
}

func (repo *DefatultUserRepository)GetUserRoles(userID string,dbName string)(string,error){
	row := repo.DB.QueryRow("select GROUP_CONCAT(core_role_id) as roles from  "+dbName+".core_role_core_user where core_user_id = ? group by core_user_id", userID)
	var roles string
	if err := row.Scan(&roles); err != nil {
        log.Println("get user error")
		log.Println(err)
        return "", err
    }
	return roles, nil
}

func (repo *DefatultUserRepository)CreateOperationLog(appDB string,operationLog OperationLog){
	log.Println("CreateOperationLog",appDB,operationLog)
	_, err :=repo.DB.Exec(
		"insert into "+appDB+".core_operation_log(operation_type,source_type,ip,result,create_time,create_user,update_time,update_user) values(?,?,?,?,?,?,?,?)",
		operationLog.OperationType,
		operationLog.SourceType,
		operationLog.IP,
		operationLog.Result,
		operationLog.CreateTime,
		operationLog.CreateUser,
		operationLog.UpdateTime,
		operationLog.UpdateUser)
	if err != nil {
		log.Println("CreateOperationLog error")
		log.Println(err)
	}
}

func (repo *DefatultUserRepository)Connect(
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