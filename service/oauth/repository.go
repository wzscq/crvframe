package oauth

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
	"log/slog"
	"time"
	"fmt"
)

type OAuthConf struct {
	AuthorizeUrl string  `json:"oauth2_authorize_url"`
	AccessTokenUrl string  `json:"oauth2_accessToken_url"`
	UserInfoUrl string  `json:"oauth2_userInfo_url"`
	BackUrl string  `json:"oauth2_back_url"`
	ClientID     string `json:"client_id"`
	ClientSecret string `json:"client_secret"`
	GrantType     string `json:"grant_type"`
	KeyOfUserID     string `json:"key_of_user_id"`
}

type OAuthConfRepository interface {
	GetOAuthConf(dbName string) (*OAuthConf, error)
}

type DefatultOAuthConfRepository struct {
	DB *sql.DB
}

func (repo *DefatultOAuthConfRepository) GetOAuthConf(dbName string) (*OAuthConf, error) {
	var oauthConf OAuthConf
	row := repo.DB.QueryRow("select oauth2_authorize_url,oauth2_accessToken_url,oauth2_userInfo_url,oauth2_back_url,client_id,client_secret,grant_type,key_of_user_id from "+dbName+".core_oauth2_conf limit 0,1")
	if err := row.Scan(&oauthConf.AuthorizeUrl, &oauthConf.AccessTokenUrl, &oauthConf.UserInfoUrl,&oauthConf.BackUrl, &oauthConf.ClientID, &oauthConf.ClientSecret, &oauthConf.GrantType, &oauthConf.KeyOfUserID); err != nil {
		slog.Error("get oauth config error", "error", err)
		return &oauthConf, err
	}
	return &oauthConf, nil
}

func (repo *DefatultOAuthConfRepository) Connect(
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
	}*/
	// Get a database handle.
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
