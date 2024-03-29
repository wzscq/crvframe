package user

import (
	"github.com/go-redis/redis/v8"
	"time"
	"crypto/tls"
)

type DefatultLoginCache struct {
	client *redis.Client
	expire time.Duration
}

func (cache *DefatultLoginCache) Init(url string, db int, expire time.Duration, password string, useTLS string) {
	var tlsConf *tls.Config
	if useTLS=="true" {
		tlsConf=&tls.Config{
			MinVersion: tls.VersionTLS12,
		}
	}

	cache.client = redis.NewClient(&redis.Options{
		Addr:     url,
		Password: password, // no password set
		DB:       db,       // use default DB
		TLSConfig: tlsConf,
	})
	cache.expire = expire
}

func (cache *DefatultLoginCache) SetCache(userID string, token string, dbName string, userRoles string) error {
	err := cache.client.Set(cache.client.Context(), dbName+"_userID:"+userID, token, cache.expire).Err()
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

func (cache *DefatultLoginCache) RemoveCache(dbName string, userID string, token string) {
	cache.client.Del(cache.client.Context(), dbName+"_userID:"+userID)
	cache.client.Del(cache.client.Context(), "userRoles:"+token)
	cache.client.Del(cache.client.Context(), "token:"+token)
	cache.client.Del(cache.client.Context(), "tokenDB:"+token)
}

func (cache *DefatultLoginCache) RemoveUser(dbName string, userID string) {
	token, err := cache.GetUserToken(dbName, userID)
	if err == nil {
		cache.RemoveCache(dbName, userID, token)
	}
}

func (cache *DefatultLoginCache) GetUserID(token string) (string, error) {
	return cache.client.Get(cache.client.Context(), "token:"+token).Result()
}

func (cache *DefatultLoginCache) GetAppDB(token string) (string, error) {
	return cache.client.Get(cache.client.Context(), "tokenDB:"+token).Result()
}

func (cache *DefatultLoginCache) GetUserRoles(token string) (string, error) {
	return cache.client.Get(cache.client.Context(), "userRoles:"+token).Result()
}

func (cache *DefatultLoginCache) GetUserToken(dbName string, userID string) (string, error) {
	return cache.client.Get(cache.client.Context(), dbName+"_userID:"+userID).Result()
}

func (cache *DefatultLoginCache) GetTokenTTL(token string) (time.Duration, error) {
	return cache.client.TTL(cache.client.Context(), "token:"+token).Result()
}
