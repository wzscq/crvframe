package data

import (
	"encoding/json"
	"log/slog"
	"time"
	"regexp"
	"strings"
)

func ProcessList(
	list *[]map[string]interface{},
	userID string) {
		//先将条件转换成json，然后再反序列化回对象
	jsonStr, err := json.Marshal(list)
	if err != nil {
		slog.Debug("replaceFilterVar Marshal filter error")
		slog.Error(err.Error())
	}

	listStr, replaced := replaceListString(string(jsonStr), userID)

	if replaced == true {
		if err := json.Unmarshal([]byte(listStr), list); err != nil {
			slog.Debug("ProcessList Unmarshal filter error")
			slog.Error(err.Error())
		}
	}
}

func replaceListString(listStr string, userID string) (string, bool) {
	slog.Debug("replaceListString start", "listStr", listStr)

	currentDate := time.Now().Format("2006-01-02")
	currentTime := time.Now().Format("2006-01-02 15:04:05")

	re := regexp.MustCompile(`%{([A-Z|a-z|_|0-9|.]*)}`)
	replaceItems := re.FindAllStringSubmatch(listStr, -1)
	replaced := false
	if replaceItems != nil {
		for _, replaceItem := range replaceItems {
			slog.Debug("replaceListString replaceItem", "item0", replaceItem[0], "item1", replaceItem[1])
			repalceStr := getListReplaceString(replaceItem[1], userID, currentDate, currentTime)
			listStr = strings.Replace(listStr, replaceItem[0], repalceStr, -1)
		}
		replaced = true
	}
	slog.Debug("replaceListString end", "listStr", listStr)
	return listStr, replaced
}

func getListReplaceString(filterItem string, userID, currentDate,currentTime string) string {
	if filterItem == "userID" {
		return userID
	}

	if filterItem == "currentDate" {
		return currentDate
	}

	if filterItem == "currentTime" {
		return currentTime
	}

	return filterItem
}

