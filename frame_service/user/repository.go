package user

import (
	"database/sql"
	"github.com/go-sql-driver/mysql"
	"log"
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

type UserRepository interface {
	getUser(userID string,dbName string)(*User,error)
	updatePassword(userID string,password string,dbName string)(error)
	getUserRoles(userID string,dbName string)(string,error)
}

type DefatultUserRepository struct {
	DB *sql.DB
}

func (repo *DefatultUserRepository)getUser(userID string,dbName string)(*User,error){
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

func (repo *DefatultUserRepository)getUserRoles(userID string,dbName string)(string,error){
	row := repo.DB.QueryRow("select GROUP_CONCAT(core_role_id) as roles from  "+dbName+".core_role_core_user where core_user_id = ? group by core_user_id", userID)
	var roles string
	if err := row.Scan(&roles); err != nil {
        log.Println("get user error")
		log.Println(err)
        return "", err
    }
	return roles, nil
}

func (repo *DefatultUserRepository)Connect(server string,user string,password string,dbName string){
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