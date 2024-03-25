package common

import (
	"testing"
)

func TestDBInit(t *testing.T) {
	appCache:=&DefatultAppCache{}
	url:="azurek8s.redis.cache.chinacloudapi.cn:6380"
	db:=0
	password:="Jz2bdA9sE2H4KI6kKVc9h5SbVhsiPJG9AAzCaD10yho="
	useTLS:="true"
	appCache.Init(url,db,password,useTLS)
	if appCache.client == nil {
		t.Error("error")
		return
	}

	_,err:=appCache.GetAppDB("test")
	if err!=nil {
		t.Error(err.Error())
		return
	}
}