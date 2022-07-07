package user

import (
	"github.com/go-redis/redis/v8"
	"time"
)

type DefatultLoginCache struct {
	client *redis.Client
	expire time.Duration
}

func (cache *DefatultLoginCache)Init(url string,db int,expire time.Duration){
	cache.client=redis.NewClient(&redis.Options{
        Addr:     url,
        Password: "", // no password set
        DB:       db,  // use default DB
    })
	cache.expire=expire
}

func (cache *DefatultLoginCache)SetCache(userID string,token string,dbName string,userRoles string)(error){
	err := cache.client.Set(cache.client.Context(), "userID:"+userID, token, cache.expire).Err()
    if err!=nil {
		return err
	}
	err = cache.client.Set(cache.client.Context(), "tokenDB:"+token, dbName, cache.expire).Err()
    if err!=nil {
		return err
	}
	err = cache.client.Set(cache.client.Context(), "userRoles:"+token, userRoles, cache.expire).Err()
    if err!=nil {
		return err
	}
	return cache.client.Set(cache.client.Context(), "token:"+token, userID, cache.expire).Err()
}

func (cache *DefatultLoginCache)RemoveCache(userID string,token string){
	cache.client.Del(cache.client.Context(), "userID:"+userID)
	cache.client.Del(cache.client.Context(), "userRoles:"+token)
    cache.client.Del(cache.client.Context(), "token:"+token)
	cache.client.Del(cache.client.Context(), "tokenDB:"+token)
}

func (cache *DefatultLoginCache)RemoveUser(userID string){
	token,err:=cache.GetUserToken(userID)
	if err == nil {
		cache.RemoveCache(userID,token)
	}
}

func (cache *DefatultLoginCache)GetUserID(token string)(string,error){
	return cache.client.Get(cache.client.Context(), "token:"+token).Result()
}

func (cache *DefatultLoginCache)GetAppDB(token string)(string,error){
	return cache.client.Get(cache.client.Context(), "tokenDB:"+token).Result()
}

func (cache *DefatultLoginCache)GetUserRoles(token string)(string,error){
	return cache.client.Get(cache.client.Context(), "userRoles:"+token).Result()
}

func (cache *DefatultLoginCache)GetUserToken(userID string)(string,error){
	return cache.client.Get(cache.client.Context(), "userID:"+userID).Result()
}
