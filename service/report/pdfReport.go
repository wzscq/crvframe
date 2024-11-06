package report

import (
	"crv/frame/data"
	"github.com/signintech/gopdf"
	"github.com/xuri/excelize/v2"
	"github.com/wzscq/excel2pdf"
	"github.com/wzscq/exceltemplate"
	"io/ioutil"
	"log/slog"
	"fmt"
)

func GetPDFReport(rootPath,appDB,reportID,controlID,parentID string,data *data.QueryResult)(*gopdf.GoPdf,error) {
	excel,err:=GetExcelFile(rootPath,appDB,reportID,controlID,parentID,data)
	if err!=nil {
		return nil,err
	}

	//outFile := rootPath+"/apps/" + appDB + "/reports/" + reportID + "/"+parentID+"_"+controlID+"/test.xlsx"
	//slog.Debug("outFile", "outFile", outFile)
	//excel.SaveAs(outFile)
	
	return GetPDFFromExcel(rootPath,appDB,reportID,controlID,parentID,excel)
}

func GetExcelFile(rootPath,appDB,reportID,controlID,parentID string,data *data.QueryResult)(*excelize.File,error) {
	//data.list 转换为 interface{}数组
	list:=make([]interface{},len(data.List))
	for i,v:=range data.List {
		list[i]=v
	}

	//data转换为map
	mapData:=map[string]interface{}{
		"data":map[string]interface{}{
			"list":list,
		},
	}

	//模板路径
	templatePath := rootPath+"/apps/" + appDB + "/reports/" + reportID + "/"+parentID+"_"+controlID+"/template.xlsx"
	excel,err:=exceltemplate.GetExcelFromTemplate(templatePath,mapData)
	if err!=nil {
		return nil,err
	}

	return excel,nil
}

func GetPDFFromExcel(rootPath,appDB,reportID,controlID,parentID string,excel *excelize.File)(*gopdf.GoPdf,error) {
	//创建pdf对象
	pdf := &gopdf.GoPdf{}
	pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})

	//字体路径
	fontPath := rootPath+"/apps/" + appDB + "/reports/" + reportID + "/"+parentID+"_"+controlID+"/fonts"
	//加载字体，从路径中读取所有的ttf文件
	fonts, err := ioutil.ReadDir(fontPath)
	if err == nil {
		defaultFont := ""
		for _, font := range fonts {
			fontNameAll := font.Name()
			if fontNameAll[len(fontNameAll)-4:] == ".ttf" {
				fontName := fontNameAll[:len(fontNameAll)-4]
				pdf.AddTTFFont(fontName, fontPath+"/"+fontNameAll)

				if defaultFont == "" {
					defaultFont = fontName
				}
			}
		}
		//设置第一个字体为默认字体
		if defaultFont != "" {
			fmt.Println("defaultFont:", defaultFont)
			pdf.SetFont(defaultFont, "", 12)
		}

	} else {
		slog.Error("read font path error", "error", err)
	}

	err=excel2pdf.Excel2Pdf(excel,pdf)
	if err!=nil {
		return nil,err
	}

	//outFile := rootPath+"/apps/" + appDB + "/reports/" + reportID + "/"+parentID+"_"+controlID+"/test.pdf"
	//slog.Debug("outFile", "outFile", outFile)
	//err = pdf.WritePdf(outFile)

	return pdf,nil
}