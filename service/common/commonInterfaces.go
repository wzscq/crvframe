package common

type LoginCache interface {
	SetCache(userID string,token string,dbName string,userRoles string)(error)
	GetUserID(token string)(string,error)
	GetAppDB(token string)(string,error)
	RemoveUser(userID string)
	GetUserRoles(token string)(string,error)
}

type AppCache interface {
	GetAppDB(appID string)(string,error)
}