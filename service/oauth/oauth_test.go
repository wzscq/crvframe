package oauth

import (
	"testing"
)

func TestGetMapDataString(t *testing.T) {
	mapData := map[string]interface{}{
		"key1": "value1",
		"key2": map[string]interface{}{
			"key3": "value3",
			"key4": []interface{}{
				map[string]interface{}{
					"key5": "value5",
				},
			},
		},
	}

	path := "key2.key4.key5"
	value := getMapDataString(path, &mapData)
	if value != "value5" {
		t.Error("error")
		return
	}

	path = "key2.key3"
	value = getMapDataString(path, &mapData)
	if value != "value3" {
		t.Error("error")
		return
	}

	path = "key1"
	value = getMapDataString(path, &mapData)
	if value != "value1" {
		t.Error("error")
		return
	}	
}