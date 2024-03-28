package oauth

import (
	"crv/frame/common"
	"crv/frame/definition"
	"crv/frame/user"
	"database/sql"
	"encoding/json"
	//"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"io/ioutil"
	"strings"
	"reflect"
	"fmt"
)

type OauthToken struct {
	AccessToken string `json:"access_token"`
}

/*type OauthUser struct {
	LoginName string `json:"loginName"`
}*/

func getAccessToken(appDB, oauthCode string) (string, *common.CommonError) {
	//获取用户access_token
	oauthAccessTokenAPI, errorCode := definition.GetApiConfig(appDB, API_OAUTH2_ACCESSTOKEN)
	if errorCode != common.ResultSuccess {
		slog.Error("OAuthClient getAccessToken get api url error", "errorCode", errorCode)
		return "", common.CreateError(errorCode, nil)
	}

	accessTokenUrl,ok := oauthAccessTokenAPI["url"]
	if !ok {
		slog.Error("OAuthClient getAccessToken get api url error")
		params:=map[string]interface{}{"error":"no url in api config"}
		return "", common.CreateError(common.ResultBadExternalApiUrl, params)
	}
	accessTokenUrlStr,Ok:=accessTokenUrl.(string)
	if !Ok {
		slog.Error("OAuthClient getAccessToken get api url error")
		params:=map[string]interface{}{"error":"no url in api config"}
		return "", common.CreateError(common.ResultBadExternalApiUrl, params)
	}

	slog.Info("getAccessToken", "accessTokenUrl",accessTokenUrlStr )
	delete (oauthAccessTokenAPI,"url")

	data := url.Values{}
	data.Set("code", oauthCode)
	for key, value := range oauthAccessTokenAPI {
		data.Set(key, value.(string))
	}
	rsp, err := http.PostForm(accessTokenUrlStr,data)

	if err != nil {
		slog.Error("OAuthClient getAccessToken do request error", "error", err)
		params:=map[string]interface{}{"error":err.Error()}
		return "", common.CreateError(common.ResultPostExternalApiError, params)
	}
	defer rsp.Body.Close()

	if rsp.StatusCode != 200 {
		body, _ := ioutil.ReadAll(rsp.Body)
		slog.Error("OAuthClient getAccessToken bad status", "StatusCode", rsp.StatusCode,"body",string(body))
		return "", common.CreateError(common.ResultPostExternalApiError, nil)
	}

	decoder := json.NewDecoder(rsp.Body)
	var oauthToken OauthToken
	err = decoder.Decode(&oauthToken)
	if err != nil {
		slog.Error("OAuthClient getAccessToken result decode failed", "error", err.Error())
		return "", common.CreateError(common.ResultPostExternalApiError, nil)
	}

	return oauthToken.AccessToken, nil
}

func getUserID(appDB, oauthToken string) (string, *common.CommonError) {
	//获取用户ID
	getUserInfoUrlAPI, errorCode := definition.GetApiConfig(appDB, API_OAUTH2_USERINFO)
	if errorCode != common.ResultSuccess {
		slog.Error("OAuthClient getUserID get api url error", "errorCode", errorCode)
		return "", common.CreateError(errorCode, nil)
	}

	url,ok := getUserInfoUrlAPI["url"]
	if !ok {
		slog.Error("OAuthClient getUserID get api url error")
		params:=map[string]interface{}{"error":"no url in api config"}
		return "", common.CreateError(common.ResultBadExternalApiUrl, params)
	}
	getUserInfoUrl,Ok:=url.(string)
	if !Ok {
		slog.Error("OAuthClient getUserID get api url error")
		params:=map[string]interface{}{"error":"no url in api config"}
		return "", common.CreateError(common.ResultBadExternalApiUrl, params)
	}

	keyOfUserID,ok:=getUserInfoUrlAPI["keyOfUserID"]
	if !ok {
		slog.Error("OAuthClient getUserID get api url error")
		params:=map[string]interface{}{"error":"no keyOfUserID in api config"}
		return "", common.CreateError(common.ResultBadExternalApiUrl, params)
	}

	keyOfUserIDStr,Ok:=keyOfUserID.(string)
	if !Ok {
		slog.Error("OAuthClient getUserID get api url error")
		params:=map[string]interface{}{"error":"no keyOfUserID in api config"}
		return "", common.CreateError(common.ResultBadExternalApiUrl, params)
	}

	//getUserInfoUrl = fmt.Sprintf(getUserInfoUrl, oauthToken)
	req, err := http.NewRequest(http.MethodGet, getUserInfoUrl, nil)
	if err != nil {
		slog.Error("OAuthClient getUserInfo new request error", "error", err)
		return "", common.CreateError(common.ResultPostExternalApiError, nil)
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", oauthToken)

	rsp, err := (&http.Client{}).Do(req)
	if err != nil {
		slog.Error("OAuthClient getUserInfo do request error", "error", err)
		return "", common.CreateError(common.ResultPostExternalApiError, nil)
	}
	defer rsp.Body.Close()

	if rsp.StatusCode != 200 {
		body,_:=ioutil.ReadAll(rsp.Body)
		slog.Error("OAuthClient getUserInfo bad status", "StatusCode", rsp.StatusCode,"body",string(body))
		return "", common.CreateError(common.ResultPostExternalApiError, nil)
	}

	//body,_:=ioutil.ReadAll(rsp.Body)
	//slog.Info("OAuthClient getUserInfo", "body", string(body))

	decoder := json.NewDecoder(rsp.Body)
	var user map[string]interface{}
	err = decoder.Decode(&user)
	if err != nil {
		slog.Error("OAuthClient getUserInfo result decode failed", "error", err)
		return "", common.CreateError(common.ResultPostExternalApiError, nil)
	}

	userID:=getMapDataString(keyOfUserIDStr, &user)

	slog.Info("OAuthClient getUserInfo", "userID", userID)

	return userID, nil
}

func localLogin(
	userRepository user.UserRepository,
	loginCache common.LoginCache,
	AppID, appDB, userID, ip string, loginLogApps map[string]bool) (*user.LoginResult, *common.CommonError) {
	//查询用户信息
	userInfo, err := userRepository.GetUser(userID, appDB)
	if err != nil {
		user.WriteLoginLog(appDB, ip, userID, "fail", userRepository, loginLogApps)
		if err == sql.ErrNoRows {
			return nil, common.CreateError(common.ResultWrongUserPassword, nil)
		}
		return nil, common.CreateError(common.ResultAccessDBError, nil)
	}

	//查询用户角色信息
	userRoles, err := userRepository.GetUserRoles(userID, appDB)
	if err != nil {
		user.WriteLoginLog(appDB, ip, userID, "fail", userRepository, loginLogApps)
		if err == sql.ErrNoRows {
			return nil, common.CreateError(common.ResultNoUserRole, nil)
		}
		return nil, common.CreateError(common.ResultAccessDBError, nil)
	}

	//获取本地token
	token := user.GetLoginToken()
	loginCache.RemoveUser(appDB, userID)
	err = loginCache.SetCache(userID, token, appDB, userRoles)
	if err != nil {
		slog.Error(err.Error())
		user.WriteLoginLog(appDB, ip, userID, "fail", userRepository, loginLogApps)
		return nil, common.CreateError(common.ResultCreateTokenError, nil)
	}

	//获取当前用户的初始操作
	initOperations := definition.GetOperations(appDB, userRoles)
	//获取应用配置信息
	appConf, _ := definition.GetAPPConf(appDB)
	//获取用户菜单组
	menuGroups, _ := definition.GetUserMenuGroups(appDB, userRoles)

	result := &user.LoginResult{
		UserID:         userInfo.UserID,
		UserName:       userInfo.UserNameZh,
		Token:          common.EncodeToken(token),
		AppID:          AppID,
		InitOperations: initOperations,
		AppConf:        appConf,
		MenuGroups:     menuGroups,
	}
	user.WriteLoginLog(appDB, ip, userID, "success", userRepository, loginLogApps)
	return result, nil
}

func getMapDataString(path string, data *map[string]interface{}) string {
	//首先对path按照点好拆分
	values := []string{}
	pathNodes := strings.Split(path, ".")
	getPathData(pathNodes, 0, data, &values)
	if len(values) > 0 {
		return values[0]
	}
	return ""
}

func getPathData(path []string, level int, data *map[string]interface{}, values *[]string) {
	pathNode := path[level]

	dataStr, _ := json.Marshal(data)
	slog.Debug("getPathData", "pathNode", pathNode, "level", level, "data", string(dataStr))

	dataNode, ok := (*data)[pathNode]
	if !ok {
		slog.Debug("getPathData no pathNode ", "pathNode", pathNode)
		return
	}

	//如果当前层级为左后一层
	if len(path) == (level + 1) {
		switch dataNode.(type) {
		case string:
			sVal, _ := dataNode.(string)
			*values = append(*values, sVal)
		case int64:
			iVal, _ := dataNode.(int64)
			sVal := fmt.Sprintf("%d", iVal)
			*values = append(*values, sVal)
		default:
			slog.Debug("getPathData not supported value type", "dataNode type", reflect.TypeOf(dataNode))
		}
	} else {
		switch dataNode.(type) {
		case map[string]interface{}:
			mapData, _ := dataNode.(map[string]interface{})
			getPathData(path, level+1, &mapData, values)
		case []interface{}:
			listData, _ := dataNode.([]interface{})
			for _, row := range listData {
				mapData, ok := row.(map[string]interface{})
				if !ok {
					slog.Debug("getPathData dataNode is not a map[string]interface{} ")
					return
				}
				getPathData(path, level+1, &mapData, values)
			}
		default:
			slog.Debug("getPathData not supported value type", "dataNode type", reflect.TypeOf(dataNode))
		}
		return
	}
}
