package oauth

import (
	"crv/frame/common"
	"crv/frame/definition"
	"crv/frame/user"
	"net/http"
	"fmt"
	"log/slog"
	"encoding/json"
	"database/sql"
)

type OauthToken struct {
	AccessToken string `json:"access_token"`
}

type OauthUser struct {
	LoginName string `json:"loginName"`
}

func getAccessToken(appDB,oauthCode string)(string,*common.CommonError){
	//获取用户access_token
	accessTokenUrl,errorCode:=definition.GetApiUrl(appDB,API_OAUTH2_ACCESSTOKEN)
	if(errorCode != common.ResultSuccess){
		slog.Error("OAuthClient getAccessToken get api url error","errorCode",errorCode)
		return "",common.CreateError(errorCode,nil)
	}

	accessTokenUrl=fmt.Sprintf(accessTokenUrl,oauthCode)
	req, err := http.NewRequest(http.MethodPost, accessTokenUrl, nil)
	if err != nil {
		slog.Error("OAuthClient getAccessToken new request error","error",err)
		return "",common.CreateError(common.ResultPostExternalApiError,nil)
	}

	req.Header.Set("Accept","application/json")
	rsp, err := (&http.Client{}).Do(req)
	if err != nil {
		slog.Error("OAuthClient getAccessToken do request error","error",err)
		return "",common.CreateError(common.ResultPostExternalApiError,nil)
	}
	defer rsp.Body.Close()

	if rsp.StatusCode != 200 { 
		slog.Error("OAuthClient getAccessToken bad status","rsp",rsp)
		return "",common.CreateError(common.ResultPostExternalApiError,nil)
	}

	decoder := json.NewDecoder(rsp.Body)
	var oauthToken OauthToken
	err = decoder.Decode(&oauthToken)
	if err != nil {
		slog.Error("OAuthClient getAccessToken result decode failed","error", err.Error())
		return "",common.CreateError(common.ResultPostExternalApiError,nil)
	}

	return oauthToken.AccessToken,nil
}

func getUserID(appDB,oauthToken string)(string,*common.CommonError){
	//获取用户ID
	getUserInfoUrl,errorCode:=definition.GetApiUrl(appDB,API_OAUTH2_USERINFO)
	if(errorCode != common.ResultSuccess){
		slog.Error("OAuthClient getUserInfo get api url error","errorCode",errorCode)
		return "",common.CreateError(errorCode,nil)
	}

	getUserInfoUrl=fmt.Sprintf(getUserInfoUrl,oauthToken)
	req, err := http.NewRequest(http.MethodGet, getUserInfoUrl, nil)
	if err != nil {
		slog.Error("OAuthClient getUserInfo new request error","error",err)
		return "",common.CreateError(common.ResultPostExternalApiError,nil)
	}

	req.Header.Set("Accept","application/json")
	req.Header.Set("Authorization","token "+oauthToken)

	rsp, err := (&http.Client{}).Do(req)
	if err != nil {
		slog.Error("OAuthClient getUserInfo do request error","error",err)
		return "",common.CreateError(common.ResultPostExternalApiError,nil)
	}
	defer rsp.Body.Close()

	if rsp.StatusCode != 200 { 
		slog.Error("OAuthClient getUserInfo bad status","rsp",rsp)
		return "",common.CreateError(common.ResultPostExternalApiError,nil)
	}

	decoder := json.NewDecoder(rsp.Body)
	var user OauthUser
	err = decoder.Decode(&user)
	if err != nil {
		slog.Error("OAuthClient getUserInfo result decode failed","error",err)
		return "",common.CreateError(common.ResultPostExternalApiError,nil)
	}

	return user.LoginName,nil
}

func localLogin(
	userRepository user.UserRepository,
	loginCache common.LoginCache,
	AppID,appDB,userID string)(*user.LoginResult,*common.CommonError){
	//查询用户信息
	userInfo,err:=userRepository.GetUser(userID,appDB)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil,common.CreateError(common.ResultWrongUserPassword,nil)
		}
		return nil,common.CreateError(common.ResultAccessDBError,nil)
	}

	//查询用户角色信息
	userRoles,err:=userRepository.GetUserRoles(userID,appDB)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil,common.CreateError(common.ResultNoUserRole,nil)
		}
		return nil,common.CreateError(common.ResultAccessDBError,nil)
	}

	//获取本地token
	token:=user.GetLoginToken()
	loginCache.RemoveUser(appDB,userID)
	err=loginCache.SetCache(userID,token,appDB,userRoles)
	if err != nil {
		slog.Error(err.Error())
		return nil,common.CreateError(common.ResultCreateTokenError,nil)
	}
	
	//获取当前用户的初始操作
	initOperations:=definition.GetOperations(appDB,userRoles)
	//获取应用配置信息
	appConf,_:=definition.GetAPPConf(appDB)
	result:=&user.LoginResult{
		UserID:userInfo.UserID,
		UserName:userInfo.UserNameZh,
		Token:common.EncodeToken(token),
		AppID:AppID,
		InitOperations:initOperations,
		AppConf:appConf,
	}
	return result,nil
}