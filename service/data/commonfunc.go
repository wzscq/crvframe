package data

import (
	"strings"
	//"log"
)

func replaceApostrophe(str string) string {
	//log.Println(str)
	replacedStr := strings.ReplaceAll(str, "'", "''")
	//log.Println(replacedStr)
	return replacedStr
}
