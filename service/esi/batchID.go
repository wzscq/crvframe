package esi

import (
	"time"
	"sync"
)

var g_batch_number int64
var g_batch_number_mutex sync.Mutex

func GetBatchID()(string){
	g_batch_number_mutex.Lock()
	nowNumber:=time.Now().Unix()
	if nowNumber>g_batch_number {
		g_batch_number=nowNumber
	} else {
		g_batch_number+=1
	}
	t:=time.Unix(g_batch_number,0)
	g_batch_number_mutex.Unlock()
	return t.Format("20060102150405")
}