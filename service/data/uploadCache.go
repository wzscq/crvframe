package data

import (
	"github.com/go-redis/redis/v8"
	"time"
)

type UploadCache interface {
	SaveUploadKey(key string, appDB string, userID string) error
	GetUploadAppDB(key string) (string, error)
	GetUploadUser(key string) (string, error)
	RemoveUploadKey(key string)
}

type DefatultUploadCache struct {
	client *redis.Client
	expire time.Duration
}

func (cache *DefatultUploadCache) Init(url string, db int, expire time.Duration, password string) {
	cache.client = redis.NewClient(&redis.Options{
		Addr:     url,
		Password: password, // no password set
		DB:       db,       // use default DB
	})
	cache.expire = expire
}

func (cache *DefatultUploadCache) SaveUploadKey(key string, appDB string, userID string) error {
	err := cache.client.Set(cache.client.Context(), "uploadAppDB:"+key, appDB, cache.expire).Err()
	if err != nil {
		return err
	}
	return cache.client.Set(cache.client.Context(), "uploadUser:"+key, userID, cache.expire).Err()
}

func (cache *DefatultUploadCache) GetUploadAppDB(key string) (string, error) {
	return cache.client.Get(cache.client.Context(), "uploadAppDB:"+key).Result()
}

func (cache *DefatultUploadCache) GetUploadUser(key string) (string, error) {
	return cache.client.Get(cache.client.Context(), "uploadUser:"+key).Result()
}

func (cache *DefatultUploadCache) RemoveUploadKey(key string) {
	cache.client.Del(cache.client.Context(), "uploadAppDB:"+key)
	cache.client.Del(cache.client.Context(), "uploadUser:"+key)
}
