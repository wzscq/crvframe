package esi

/*
excel表格内容模式识别
1、对于一个模型的数据，可以通过配置每个字段的模式匹配表达式用于匹配
	模式匹配表达式可以包括内容和标题两种表达式，
	每个字段的每种表达式可以设置多个，
	每个表达式可以设置一个权重值
2、程序扫描excel文件内容，对于每个单元格的值，使用字段中配置的表达式进行模式匹配，对于匹配上的单元格打上对应标记
    每个单元格可能匹配上多个字段的不同表达式，都做相应的标记
3、标记完成后根据标记结果计算对应的字段，包括两个步骤
	对于每个单元格中的标记进行权重计算，计算单元格对应字段，在单元格对应标记中按照不同字段对标记的权重值进行累加，取最高值的字段
	对于相同列上的不同单元格的结果进行聚合计算最终的对应字段，取所有单元格中对应的字段出现次数最多的字段
*/

import (
	"regexp"
	"strings"
)

type recognizedLabelCell struct {
	Row int `json:"row"`
	Col int `json:"col"`
	Field *esiModelField `json:"field"`
}

type patternContentHandler struct {
	ESIModel *esiModelSpec
	//RecognizedLabelCells用于保存识别出的标题单元格，使用单元格的row,col作为map的key
	RecognizedLabelCells map[int]map[int]*recognizedLabelCell
	//RecognizedValueCells用于保存识别出的数值单元格，使用单元格的row,col作为map的key
	RecognizedValueCells map[int]map[int]*recognizedLabelCell
	//IgnoreLabelRows用于保存识别出的需要忽略的行，使用行号作为map的key
	IgnoreLabelRows map[int]interface{}
	//DataRow用于判断某个行是否是空行，按照行号作为map的key，没有的行号认为是空行
	DataRow map[int]interface{}  
	//TempRow用于缓存当前识别出的字段值，当遇到行结束标志时，就会将这个行的数据写入ModelData
	TempRow map[string]string
}

func getContentHandler(esiModel *esiModelSpec)(*patternContentHandler){
	return &patternContentHandler{
		ESIModel:esiModel,
		TempRow:map[string]string{},
		DataRow:map[int]interface{}{},
	}
}

func (epr *patternContentHandler)resetAll(){
	epr.RecognizedLabelCells=nil
	epr.RecognizedValueCells=nil
	epr.IgnoreLabelRows=nil
	epr.DataRow=map[int]interface{}{}
	epr.TempRow=map[string]string{}
}

func (epr *patternContentHandler)addValueCell(
	row,col int,
	labelCell *recognizedLabelCell){
	
	if epr.RecognizedValueCells==nil {
		epr.RecognizedValueCells=map[int]map[int]*recognizedLabelCell{}
	}

	_,ok:=epr.RecognizedValueCells[row]
	if !ok {
		epr.RecognizedValueCells[row]=map[int]*recognizedLabelCell{}
	}

	epr.RecognizedValueCells[row][col]=labelCell
}

func (epr *patternContentHandler)addRecognizedLabelCell(
	row,col,dataLen int,
	esiField *esiModelField,
	data string){

	if epr.RecognizedLabelCells==nil {
		epr.RecognizedLabelCells=map[int]map[int]*recognizedLabelCell{}
	}

	rowMap,ok:=epr.RecognizedLabelCells[row]
	if !ok {
		epr.RecognizedLabelCells[row]=map[int]*recognizedLabelCell{}
		rowMap=epr.RecognizedLabelCells[row]
	}

	//这里是为了处理ExcelRangeType==auto类型的字段，
	if esiField.DetectedRangeType == "" {
		if esiField.ExcelRangeType == EXCEL_RANGE_AUTO {
			esiField.DetectedRangeType=EXCEL_RANGE_RIGHTVAL
		} else {
			esiField.DetectedRangeType=esiField.ExcelRangeType
		}
	}

	recCell,ok:=rowMap[col]
	if !ok {
		epr.RecognizedLabelCells[row][col]=&recognizedLabelCell{
			Row:row,
			Col:col,
			Field:esiField,
		}
	} else {
		//如果之前配置上了，但是现在匹配上的值和字段的正则长度更接近则替换为新的
		diffOrg:=dataLen-len(recCell.Field.LabelRegexp)
		if diffOrg<0 {
			diffOrg=diffOrg*-1
		}

		diffNow:=dataLen-len(esiField.LabelRegexp)
		if diffNow<0 {
			diffNow=diffNow*-1
		}

		if diffNow<diffOrg {
			epr.RecognizedLabelCells[row][col].Field=esiField
		}
	}
}

func (epr *patternContentHandler)matchLabelPattern(
	row,col int,
	cell string,
	esiField *esiModelField)(bool){
	//使用正则表达式匹配
	data := []byte(cell)
	if ret,_:=regexp.Match(esiField.LabelRegexp,data); ret == true	{
		//匹配上的数据作为列标题行，记录到标题行识别结果中
		//log.Printf("row:%d,col:%d, value:%s match pattern:%s\n",row,col,cell,esiField.LabelRegexp)
		//按照行列号创建索引，对每个单元格打上识别标记
		epr.addRecognizedLabelCell(row,col,len(data),esiField,cell)
		return true
	}
	return false
}

func (epr *patternContentHandler)RecognizeFieldLabelCell(
	row,col int,
	cell string)(bool){
	//log.Printf("row:%d,col:%d,val:%s\n",row,col,cell)
	isLabelCell:=false
	
	//循环每个字段，进行正则匹配
	for fidx,_:=range(epr.ESIModel.Fields) {
		esiField:=&epr.ESIModel.Fields[fidx]
		if esiField.Source!=DATA_SOURCE_INPUT{
			if epr.matchLabelPattern(row,col,cell,esiField) == true {
				isLabelCell=true
			}
		}
	}
	return isLabelCell
}

func (epr *patternContentHandler)getRecognizedLabelCell(row,col int)(*recognizedLabelCell){
	recLabelRow,ok:=epr.RecognizedLabelCells[row]
	if ok {
		recLabelCell,ok:=recLabelRow[col]
		if ok {
			return recLabelCell
		}
	}
	return nil
}

func (epr *patternContentHandler)getRecognizedValueCell(row,col int)(*recognizedLabelCell){
	recRow,ok:=epr.RecognizedValueCells[row]
	if ok {
		recLabelCell,ok:=recRow[col]
		if ok {
			return recLabelCell
		}
	}
	return nil
}

func (epr *patternContentHandler)isValueRightLabel(recLabelCell *recognizedLabelCell)(bool){
	if recLabelCell.Field==nil {
		return false
	}
	
	if recLabelCell.Field.DetectedRangeType==EXCEL_RANGE_RIGHTVAL {
		return true
	}

	return false
}

func (epr *patternContentHandler)isTableHeaderLabel(recLabelCell *recognizedLabelCell)(bool){
	if recLabelCell.Field==nil {
		return false
	}

	if recLabelCell.Field.DetectedRangeType==EXCEL_RANGE_TABLE {
		return true
	}

	return false
}

func (epr *patternContentHandler)isEmptyRow(row,col int)(bool){
	_,ok:=epr.DataRow[row]
	return !ok
}

func (epr *patternContentHandler)findRecognizedLabelCell(row,col int)(*recognizedLabelCell){
	//判断当前单元格是否属于被忽略的行上？
	/*if epr.isIgnoreCell(row,col)==true {
		return nil
	}*/
	
	//先找左侧标题
	labelCol:=col-1
	recLabelCell:=epr.getRecognizedLabelCell(row,labelCol)
	if recLabelCell!=nil {
		//判断表格类型和方向正确
		if epr.isValueRightLabel(recLabelCell)==true {
			return recLabelCell
		}
	}

	labelRow:=row-1
	if epr.ESIModel.Options.MaxHeaderRow>0{
		labelRow=epr.ESIModel.Options.MaxHeaderRow
	}
	//再找上方的标题
	for ;labelRow>=0;labelRow-- {
		if epr.isEmptyRow(labelRow,col)==true {
			return nil
		}
		/*if epr.isIgnoreCell(labelRow,col)==true {
			return nil
		}*/
		recLabelCell:=epr.getRecognizedLabelCell(labelRow,col)
		if recLabelCell!=nil {
			if epr.isTableHeaderLabel(recLabelCell)==true {
				return recLabelCell
			}
		}	
	}

	return nil
}

func (epr *patternContentHandler)RecognizeFieldValueCell(
	row,col int,
	cell string)(bool){
	
	//获取对应label单元格
	recLabelCell:=epr.findRecognizedLabelCell(row,col)
	if recLabelCell == nil {
		return false
	}

	//如果单元格的配置要求单元格不能为空而当前读取的单元格为空，则将当前行加入忽略的行
	if recLabelCell.Field.ExcelRangeType==EXCEL_RANGE_TABLE&& 
		recLabelCell.Field.EmptyValue!=EMPTY_VALUE_YES&&
		cell=="" {
		epr.addIgnoreLabelRow(row)
		//log.Printf("RecognizeFieldValueCell findRecognizedLabelCell ignore col:%d,row:%d,cell:%s\n",col,row,cell)
		return false
	}

	//按照label单元格的配置增加列数据
	epr.addValueCell(row,col,recLabelCell)
	return true
}

func (epr *patternContentHandler)addIgnoreLabelRow(row int){
	if epr.IgnoreLabelRows==nil {
		epr.IgnoreLabelRows=map[int]interface{}{}
	}

	_,ok:=epr.IgnoreLabelRows[row]
	if !ok {
		epr.IgnoreLabelRows[row]=""
	}
}

func (epr *patternContentHandler)AddTempRowToModel()(map[string]interface{}){
	newRow:=map[string]interface{}{}
	for key,val:=range(epr.TempRow){
		newRow[key]=val
	}
	return newRow
}

func (epr *patternContentHandler)setTempRowValue(
	field *esiModelField,
	cell string){
	epr.TempRow[field.Field]=cell
}

func (epr *patternContentHandler)removeIncompatibleCharacters(org string)(string){
	result:=strings.Replace(org, "\\", "\\\\", -1)
	result=strings.Replace(result, "'", "''", -1)
	return result
}

func (epr *patternContentHandler)AddModelTableField(
	row,col int,
	cell string)(map[string]interface{}){
	//获取值单元格标记
	recLabelCell:=epr.getRecognizedValueCell(row,col)
	if recLabelCell==nil {
		return nil
	}

	//Excel单个格中如果包含了特殊字符需要替换掉，否则插入数据库是会报错
	value:=epr.removeIncompatibleCharacters(cell)
	//缓存单元格的值到temprow中
	epr.setTempRowValue(recLabelCell.Field,value)
	
	//如果当前行对应的字段存在结束行标志，则保存行数据
	if recLabelCell.Field.EndRow == END_ROW_YES {
		//缓存的行数据放到表格数据中
		return epr.AddTempRowToModel()
	}

	return nil
}

func (epr *patternContentHandler)removeValueCell(row,col int){
	valueRow,ok:=epr.RecognizedValueCells[row]
	if !ok {
		return
	}

	valueCell,ok:=valueRow[col]
	if !ok {
		return
	}

	//把字段值清除
	delete(epr.TempRow,valueCell.Field.Field)
	//删除对应字段值
	delete(epr.RecognizedValueCells[row],col)
	//如果当前行为空，则将行删除
	if len(epr.RecognizedValueCells[row])==0 {
		delete(epr.RecognizedValueCells,row)
	}
}

func (epr *patternContentHandler)resetAutoLabel(row int){
	//同一行中如果包含了tableheader，则将这行行的auto列，都设置为table类型
	labelRow,ok:=epr.RecognizedLabelCells[row]
	if !ok {
		return
	}

	hasTableLabel:=false
	hasAutoLabel:=false
	for _,labelCell:=range(labelRow){
		if labelCell.Field.ExcelRangeType == EXCEL_RANGE_TABLE {
			hasTableLabel=true
		}

		if labelCell.Field.ExcelRangeType == EXCEL_RANGE_AUTO {
			hasAutoLabel=true
		}
	}

	if hasTableLabel && hasAutoLabel {
		for col,labelCell:=range(labelRow){
			if labelCell.Field.ExcelRangeType == EXCEL_RANGE_AUTO {
				epr.removeValueCell(row,col+1)
				epr.RecognizedLabelCells[row][col].Field.DetectedRangeType=EXCEL_RANGE_TABLE
			}
		}
	}
}

func (epr *patternContentHandler)resetAutoEndRow(row int){
	labelRow,ok:=epr.RecognizedLabelCells[row]
	if !ok {
		return
	}

	maxCol:=-1
	for col,_:=range(labelRow){
		if maxCol<col {
			maxCol=col
		}
	}

	if maxCol>0 {
		if epr.RecognizedLabelCells[row][maxCol].Field.DetectedRangeType == EXCEL_RANGE_TABLE &&
		   epr.RecognizedLabelCells[row][maxCol].Field.EndRow!=END_ROW_NO {
			epr.RecognizedLabelCells[row][maxCol].Field.EndRow=END_ROW_YES
		}
	}
}

func (epr *patternContentHandler)handleCell(lastRow,row,col int,content string)(map[string]interface{}){
	if lastRow!=row {
		if lastRow!=-1 {
			//在处理完一个行的数据后，对行上的autolabel类型做进一步处理
			epr.resetAutoLabel(lastRow)
			//检查当前行最后一个标题列如果时table且endrow不是no的情况下将endrow自动设置为yes
			//注意这个函数应该放在resetAutoLabel后面执行，确保先设置好列的rangetype
			epr.resetAutoEndRow(lastRow)
		}
		epr.DataRow[row]=nil
	}

	reconLabelCell:=true
	//如果设置了header的最大行数，则仅针对之前的行做header识别
	if epr.ESIModel.Options.MaxHeaderRow>0 && row>epr.ESIModel.Options.MaxHeaderRow {
		reconLabelCell=false
	}

	if reconLabelCell && epr.RecognizeFieldLabelCell(row,col,content) == true {
		return nil
	}
	
	if epr.RecognizeFieldValueCell(row,col,content) == true {
		return epr.AddModelTableField(row,col,content)
	}

	return nil
}



