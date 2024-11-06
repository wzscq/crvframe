package report

import (
	"testing"
	"fmt"
	"crv/frame/data"
)

func _TestGetExcelFile(t *testing.T){
	rootPath := "D:/github/crvframe/service"
	appDB := "pe"
	reportID := "report1"
	controlID := "control1"
	parentID := ""

	fmt.Println("TestGetExcelFile")

	data := &data.QueryResult{
		List: []map[string]interface{}{
			{
				"id":   "1",
				"name": "name1",
			},
			{
				"id":   "2",
				"name": "name2",
			},
		},
	}

	excel,err:=GetExcelFile(rootPath,appDB,reportID,controlID,parentID,data)
	if err!=nil {
		fmt.Println("GetExcelFile error")
		fmt.Println(err)
		t.Fail()
	}

	if excel==nil {
		fmt.Println("excel is nil")
		t.Fail()
	}

	outFile := rootPath+"/apps/" + appDB + "/reports/" + reportID + "/"+parentID+"_"+controlID+"/test.xlsx"

	err = excel.SaveAs(outFile)
	if err != nil {
		fmt.Println("Write excel error")
		fmt.Println(err)
		t.Fail()
	}
}

func TestGetPDFReport(t *testing.T) {

	rootPath := "D:/github/crvframe/service"
	appDB := "pe"
	reportID := "report1"
	controlID := "control1"
	parentID := ""

	fmt.Println("TestGetPDFReport")

	data := &data.QueryResult{
		List: []map[string]interface{}{
			{
				"id":   "1",
				"name": "name1",
			},
			{
				"id":   "2",
				"name": "name2",
			},
		},
	}

	pdf,err:=GetPDFReport(rootPath,appDB,reportID,controlID,parentID,data)

	if err!=nil {
		fmt.Println("GetPDFReport error")
		fmt.Println(err)
		t.Fail()
	}

	if pdf==nil {
		fmt.Println("pdf is nil")
		t.Fail()
	}

	outFile := rootPath+"/apps/" + appDB + "/reports/" + reportID + "/"+parentID+"_"+controlID+"/test.pdf"

	err = pdf.WritePdf(outFile)
	if err != nil {
		fmt.Println("WritePdf error")
		fmt.Println(err)
		t.Fail()
	}
}