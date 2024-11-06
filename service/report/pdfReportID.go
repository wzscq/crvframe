package report

import (
	"sync"
	"time"
)

var g_pdf_report_number int64
var g_pdf_report_number_mutex sync.Mutex

func GetPDFReportID() string {
	g_pdf_report_number_mutex.Lock()
	nowNumber := time.Now().Unix()
	if nowNumber > g_pdf_report_number {
		g_pdf_report_number = nowNumber
	} else {
		g_pdf_report_number += 1
	}
	t := time.Unix(g_pdf_report_number, 0)
	g_pdf_report_number_mutex.Unlock()
	return t.Format("20060102150405")
}
