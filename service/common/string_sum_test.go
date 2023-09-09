package common

import (
	"testing"
	"crypto/sha256"
	"log"
	"fmt"
)

func TestStringSum(t *testing.T) {
	bodyStr:=`{"to":"/cdirecognize/submitDataCleaningTask","task":{"id":53,"rowId":98,"modelId":"cdi_result_po","businessType":"po","cleaner":"teel","taskStatus":"01"},"resultPo":{"id":74,"poNumber":"4501289152","poDate":"08.03.2022","vendorName":"上海睿达会计师事务所有限公司","billToName":"昂高化工（中国）有限公司","shipToName":"昂高化工（中国）有限公司","totalAmount":4300,"details":[{"id":211,"sn":"00010","materialCode":"CNX2","description":"外币审计费","quantity":1,"unit":"件","price":4300,"taxRate":0,"taxAmount":0,"amount":4300}]}}`
	//bodyStr:=`"billToName":"昂高化工（中国）有限公司","shipToName":"昂高化工（中国）有限公司"`
	sha256Bytes := sha256.Sum256([]byte(bodyStr))
	sha256Str := fmt.Sprintf("%x", sha256Bytes)
	log.Println(string(sha256Str))
}