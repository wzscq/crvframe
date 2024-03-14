package oauth

import (
	"github.com/go-redis/redis/v8"
	"time"
)

type OAuthCache struct {
	client *redis.Client
	expire time.Duration
}

func (cache *OAuthCache) Init(url string, db int, expire time.Duration, password string) {
	cache.client = redis.NewClient(&redis.Options{
		Addr:     url,
		Password: password, // no password set
		DB:       db,       // use default DB
	})
	cache.expire = expire
}

func (cache *OAuthCache) SetCache(userID, token, dbName, userRoles, clientID string) error {
	err := cache.client.Set(cache.client.Context(), "tokenClient:"+token, clientID, cache.expire).Err()
	if err != nil {
		return err
	}
	err = cache.client.Set(cache.client.Context(), "tokenDB:"+token, dbName, cache.expire).Err()
	if err != nil {
		return err
	}
	err = cache.client.Set(cache.client.Context(), "userRoles:"+token, userRoles, cache.expire).Err()
	if err != nil {
		return err
	}
	return cache.client.Set(cache.client.Context(), "token:"+token, userID, cache.expire).Err()
}

func (cache *OAuthCache) RemoveCache(token string) {
	cache.client.Del(cache.client.Context(), "userRoles:"+token)
	cache.client.Del(cache.client.Context(), "token:"+token)
	cache.client.Del(cache.client.Context(), "tokenDB:"+token)
	cache.client.Del(cache.client.Context(), "tokenClient:"+token)
}

func (cache *OAuthCache) GetUserID(token string) (string, error) {
	return cache.client.Get(cache.client.Context(), "token:"+token).Result()
}

func (cache *OAuthCache) GetAppDB(token string) (string, error) {
	return cache.client.Get(cache.client.Context(), "tokenDB:"+token).Result()
}

func (cache *OAuthCache) GetUserRoles(token string) (string, error) {
	return cache.client.Get(cache.client.Context(), "userRoles:"+token).Result()
}

func (cache *OAuthCache) GetClientID(token string) (string, error) {
	return cache.client.Get(cache.client.Context(), "tokenClient:"+token).Result()
}
