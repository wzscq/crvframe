package common

import (
	"github.com/go-redis/redis/v8"
	"crypto/tls"
)

type DefatultAppCache struct {
	client *redis.Client
}

func (cache *DefatultAppCache) Init(url string, db int, password string, useTLS string) {
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
}

func (cache *DefatultAppCache) GetAppDB(appID string) (string, error) {
	return cache.client.Get(cache.client.Context(), "appid:"+appID).Result()
}
