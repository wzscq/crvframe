package common

import (
	"encoding/json"
	"fmt"
	"testing"
)

func TestLoadConfiguration(t *testing.T) {
	config := InitConfig("../conf/conf.json")
	if config == nil {
		t.Error("InitConfigViper failed")
		return
	}

	//转换为json
	jsonStr, err := json.Marshal(config)

	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(string(jsonStr))
}
