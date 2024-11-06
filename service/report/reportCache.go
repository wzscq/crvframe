package report

import (
	"github.com/go-redis/redis/v8"
	"time"
	"crypto/tls"
)

type ReportCache interface {
	SaveReportKey(key string, reportData string,requestStr string) error
	GetReportData(key string) (string, error)
	GetReportReq(key string) (string, error)
	RemoveReportKey(key string)
}

type DefatultReportCache struct {
	client *redis.Client
	expire time.Duration
}

func (cache *DefatultReportCache) Init(url string, db int, expire time.Duration, password string, useTLS string) {

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

func (cache *DefatultReportCache) SaveReportKey(key string, reportData string,requestStr string) error {
	err:=cache.client.Set(cache.client.Context(), "reportReq:"+key, requestStr, cache.expire).Err()
	if err!=nil {
		return err
	}
	
	return cache.client.Set(cache.client.Context(), "reportData:"+key, reportData, cache.expire).Err()
}

func (cache *DefatultReportCache) GetReportData(key string) (string, error) {
	return cache.client.Get(cache.client.Context(), "reportData:"+key).Result()
}

func (cache *DefatultReportCache) GetReportReq(key string) (string, error) {
	return cache.client.Get(cache.client.Context(), "reportReq:"+key).Result()
}

func (cache *DefatultReportCache) RemoveReportKey(key string) {
	cache.client.Del(cache.client.Context(), "reportReq:"+key)
	cache.client.Del(cache.client.Context(), "reportData:"+key)
}
