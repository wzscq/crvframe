package common

import (
	"github.com/go-redis/redis/v8"
)

type DefatultAppCache struct {
	client *redis.Client
}

func (cache *DefatultAppCache)Init(url string,db int){
	cache.client=redis.NewClient(&redis.Options{
        Addr:     url,
        Password: "", // no password set
        DB:       db,  // use default DB
    })
}

func (cache *DefatultAppCache)GetAppDB(appID string)(string,error){
	return cache.client.Get(cache.client.Context(), "appid:"+appID).Result()
}