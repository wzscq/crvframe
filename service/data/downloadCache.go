package data

import (
	"github.com/go-redis/redis/v8"
	"time"
)

type DownloadCache interface {
	SaveDownloadKey(key string,fileName string,orgName string)(error)
	GetDownloadFileName(key string)(string,error)
	GetOrgFileName(key string)(string,error)
	RemoveDownloadKey(key string)
}

type DefatultDownloadCache struct {
	client *redis.Client
	expire time.Duration
}

func (cache *DefatultDownloadCache)Init(url string,db int,expire time.Duration,password string){
	cache.client=redis.NewClient(&redis.Options{
        Addr:     url,
        Password: password, // no password set
        DB:       db,  // use default DB
    })
	cache.expire=expire
}

func (cache *DefatultDownloadCache)SaveDownloadKey(key string,fileName string,orgName string)(error){
	err := cache.client.Set(cache.client.Context(), "downloadOrgName:"+key, orgName, cache.expire).Err()
	if err!=nil {
		return err
	}
	return cache.client.Set(cache.client.Context(), "download:"+key, fileName, cache.expire).Err()
}

func (cache *DefatultDownloadCache)GetDownloadFileName(key string)(string,error){
	return cache.client.Get(cache.client.Context(), "download:"+key).Result()
}

func (cache *DefatultDownloadCache)GetOrgFileName(key string)(string,error){
	return cache.client.Get(cache.client.Context(), "downloadOrgName:"+key).Result()
}

func (cache *DefatultDownloadCache)RemoveDownloadKey(key string){
	cache.client.Del(cache.client.Context(), "download:"+key)
	cache.client.Del(cache.client.Context(), "downloadOrgName:"+key)
}