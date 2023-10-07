package log

import (
	"fmt"
)

type CRVLogWriter struct {
	WriteFile bool
}

func (w *CRVLogWriter)Write(p []byte) (n int, err error){
	fmt.Println(string(p))


	return len(p),nil
}