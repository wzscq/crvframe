package user

import (
	"crypto/md5"
	"fmt"
	"io"
	"strconv"
	"time"
)

func GetLoginToken()(string){
	curtime:=time.Now().Unix()
	h:=md5.New()
	io.WriteString(h,strconv.FormatInt(curtime,10))
	token:=fmt.Sprintf("%x",h.Sum(nil))
	return token
}