package oauth

import (
	"crv/frame/common"
	"crv/frame/user"
	"database/sql"
	"log/slog"
)

func checkUserPassword(userRepository user.UserRepository, userID string, password string, dbName string) (*user.User, int) {
	user, err := userRepository.GetUser(userID, dbName)
	if err != nil {
		if err == sql.ErrNoRows {
			return user, common.ResultWrongUserPassword
		}
		return user, common.ResultAccessDBError
	}

	if password != user.Password {
		return user, common.ResultWrongUserPassword
	}

	return user, common.ResultSuccess
}

func getUserRoles(userRepository user.UserRepository, userID string, dbName string) (string, int) {
	roles, err := userRepository.GetUserRoles(userID, dbName)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", common.ResultNoUserRole
		}
		return "", common.ResultAccessDBError
	}

	return roles, common.ResultSuccess
}

func cacheOAuthToken(
	oauthCache *OAuthCache, userID, token, appDB, userRoles, clientID string) int {
	err := oauthCache.SetCache(userID, token, appDB, userRoles, clientID)
	if err != nil {
		slog.Error(err.Error())
		return common.ResultCreateTokenError
	}

	return common.ResultSuccess
}

func getAppDB(appCache common.AppCache, appID string) (string, int) {
	slog.Debug("start OAuthController getAppDB")
	appDB, err := appCache.GetAppDB(appID)
	if err != nil {
		slog.Error(err.Error())
		return "", common.ResultAppDBError
	}
	slog.Debug("end OAuthController getAppDB", "appDB", appDB)
	return appDB, common.ResultSuccess
}

func oauthLogin(
	oauthCache *OAuthCache,
	userRepository user.UserRepository,
	appDB, userID, password, clientID string) (string, int) {
	_, errorCode := checkUserPassword(userRepository, userID, password, appDB)
	if errorCode != common.ResultSuccess {
		return "", errorCode
	}

	userRoles, errorCode := getUserRoles(userRepository, userID, appDB)
	if errorCode != common.ResultSuccess {
		return "", errorCode
	}

	token := getOAuthToken()
	errorCode = cacheOAuthToken(oauthCache, userID, token, appDB, userRoles, clientID)
	return token, errorCode
}
