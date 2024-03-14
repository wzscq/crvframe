package flow

import (
	"encoding/json"
	"github.com/go-redis/redis/v8"
	"log/slog"
	"time"
)

type FlowInstanceRepository interface {
	Init(url string, db int, expire time.Duration, password string)
	saveInstance(instance *flowInstance) error
	getInstance(instanceID string) (*flowInstance, error)
}

type DefaultFlowInstanceRepository struct {
	client *redis.Client
	expire time.Duration
}

func (repo *DefaultFlowInstanceRepository) Init(url string, db int, expire time.Duration, password string) {
	repo.client = redis.NewClient(&redis.Options{
		Addr:     url,
		Password: password, // no password set
		DB:       db,       // use default DB
	})
	repo.expire = expire
}

func (repo *DefaultFlowInstanceRepository) saveInstance(instance *flowInstance) error {
	// Create JSON from the instance data.
	bytes, err := json.Marshal(*instance)
	if err != nil {
		slog.Error("save flow instance error", "error", err)
		return err
	}
	// Convert bytes to string.
	jsonStr := string(bytes)
	return repo.client.Set(repo.client.Context(), instance.InstanceID, jsonStr, repo.expire).Err()
}

func (repo *DefaultFlowInstanceRepository) getInstance(instanceID string) (*flowInstance, error) {
	jsonStr, err := repo.client.Get(repo.client.Context(), instanceID).Result()
	if err != nil {
		slog.Error("get flow instance error", "error", err)
		return nil, err
	}
	// Get byte slice from string.
	bytes := []byte(jsonStr)
	instance := &flowInstance{}
	err = json.Unmarshal(bytes, instance)
	if err != nil {
		slog.Error("get flow instance error", "error", err)
		return nil, err
	}
	return instance, nil
}
