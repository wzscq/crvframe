package data

import (
	"time"
	"sync"
)

var g_data_batch_number int64
var g_data_batch_number_mutex sync.Mutex

func GetBatchID()(string){
	g_data_batch_number_mutex.Lock()
	nowNumber:=time.Now().Unix()
	if nowNumber>g_data_batch_number {
		g_data_batch_number=nowNumber
	} else {
		g_data_batch_number+=1
	}
	t:=time.Unix(g_data_batch_number,0)
	g_data_batch_number_mutex.Unlock()
	return t.Format("20060102150405")
}