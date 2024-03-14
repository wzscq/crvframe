package common

import (
	"bytes"
	"crypto/md5"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"io/ioutil"
	"log/slog"
	"time"
)

//加密token
func EncodeToken(token string) string {
	now := time.Now()                            // 获取当前时间
	strTime := now.Format("2006-01-02 15:04:05") // 将时间格式化为字符串
	//计算params的MD5码
	md5sum := md5.Sum([]byte(strTime))
	md5str := hex.EncodeToString(md5sum[:])

	var result string
	//将token和MD5str按照奇偶位置穿插合并为一个字符串
	for i := 0; i < len(token) || i < len(md5str); i++ { // 轮流取出字符，先判断哪个字符串更短
		if i < len(md5str) {
			result += string(md5str[i])
		}

		if i < len(token) {
			result += string(token[i])
		}
	}
	return result
}

func DecodeToken(token string) (string, string) {
	decodedToken := ""
	paramSum := ""

	for i := 0; i < len(token); i += 2 {
		paramSum += string(token[i])
		if len(decodedToken) < 32 {
			decodedToken += string(token[i+1])
		} else {
			paramSum += string(token[i+1])
		}
	}

	return decodedToken, paramSum
}

func CheckBody(c *gin.Context, checkSum string) int {
	reqBody, err := c.GetRawData()
	if err != nil {
		slog.Error(err.Error())
		return ResultWrongRequest
	}

	bodyCopy := &bytes.Buffer{}
	_, err = io.Copy(bodyCopy, bytes.NewReader(reqBody))
	if err != nil {
		slog.Error(err.Error())
		return ResultWrongRequest
	}

	c.Request.Body = ioutil.NopCloser(bytes.NewReader(reqBody))
	bodyStr := ""
	if len(bodyCopy.Bytes()) > 0 {
		bodyStr = string(bodyCopy.Bytes())
	}
	slog.Debug(bodyStr)
	sha256Bytes := sha256.Sum256([]byte(bodyStr))
	sha256Str := fmt.Sprintf("%x", sha256Bytes)

	if checkSum != sha256Str {
		slog.Error("ResultWrongRequest", "sha256Str", sha256Str, "checkSum", checkSum)
		return ResultWrongRequest
	}

	return ResultSuccess
}
