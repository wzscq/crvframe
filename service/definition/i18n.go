package definition

import (
	"log"
	"encoding/json"
	"os"
	"crv/frame/common"
)

type localeItem struct {
	Key string `json:"key"`
	Label string `json:"label"`
}

type appI18n struct {
	Locales *[]localeItem `json:"locales,omitempty"`
	Locale string `json:"locale"`
	Resources map[string]string `json:"resources"`
}

type i18nDefinition struct {
	Locales *[]localeItem `json:"locales,omitempty"`
	DefaultLocale *string `json:"defaultLocale,omitempty"`
	Resources *map[string]map[string]string `json:"resources,omitempty"`
}

type i18n struct {
	AppDB string
	Locale string
}

func (i18n *i18n)getLang(i18nDef *i18nDefinition)(string,int){
	//如果指定的语言在配置中存在则返回指定的语言，否则返回Default对应的值，如果Default未定义则报错
	if i18nDef.Locales == nil || len(*(i18nDef.Locales))==0 {
		log.Println("getLang error no langList")
		return "",common.ResultI18nNoLangList
	}

	//指定的语言在列表中是否存在
	for _,localeItem:= range *(i18nDef.Locales) {
		if localeItem.Key == i18n.Locale {
			return i18n.Locale,common.ResultSuccess
		}
	}

	if i18nDef.DefaultLocale==nil || len(*(i18nDef.DefaultLocale))==0 {
		return "",common.ResultI18nNoLangList
	}

	return *(i18nDef.DefaultLocale),common.ResultSuccess
}

func (i18n *i18n)createAppI18n(i18nDef *i18nDefinition,locale string)(*appI18n,int){
	appI18n:=&appI18n{
		Locales:i18nDef.Locales,
		Locale:locale,
	}
	
	if i18nDef.Resources==nil {
		return appI18n,common.ResultI18nNoLang
	}

	res,ok:=(*(i18nDef.Resources))[locale]
	if ok {
		appI18n.Resources=res
		return appI18n,common.ResultSuccess
	}

	return appI18n,common.ResultI18nNoLang
}

func (i18n *i18n)getAppI18n()(*appI18n,int){
	var i18nDef i18nDefinition
	modelFile := "apps/"+i18n.AppDB+"/i18n.json"
	filePtr, err := os.Open(modelFile)
	if err != nil {
		log.Println("Open file failed [Err:%s]", err.Error())
		return nil,common.ResultOpenFileError
	}
	defer filePtr.Close()
	// 创建json解码器
	decoder := json.NewDecoder(filePtr)
	err = decoder.Decode(&i18nDef)
	if err != nil {
		log.Println("json file decode failed [Err:%s]", err.Error())
		return nil,common.ResultJsonDecodeError
	}

	//获取当前语言
	locale,errorCode:=i18n.getLang(&i18nDef)
	if errorCode != common.ResultSuccess {
		return nil,errorCode
	}

	return i18n.createAppI18n(&i18nDef,locale)
}
