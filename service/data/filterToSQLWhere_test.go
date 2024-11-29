package data

import (
	"testing"
	"fmt"
	"crv/frame/common"
	crvlog "crv/frame/log"
	"log"
)

func TestFilterToSQLWhere(t *testing.T) {
	conf:=common.InitConfig("../conf/conf_53.json")
	if conf==nil {
		t.Errorf("InitConfig failed")
	}

	crvlog.InitCRVLog(&conf.Log)
	//设置log打印文件名和行号
	log.SetFlags(log.Lshortfile | log.LstdFlags)

	/*filter:=&map[string]interface{}{
		"Op.and": []interface{}{
			map[string]interface{}{
				"Op.and": []interface{}{
					map[string]interface{}{
						"Op.or": []interface{}{
							map[string]interface{}{
								"invoice_message": map[string]interface{}{
									"Op.eq": "",
								},
							},
							map[string]interface{}{
								"invoice_message": map[string]interface{}{
									"Op.is": nil,
								},
							},
						},
					},
				},
			},	
			map[string]interface{}{
				"is_del": "0",
				"status_id": map[string]interface{}{
					"Op.in": []interface{}{"0",},
				},
				"total_taxable_amount": map[string]interface{}{
					"Op.gt":"0",
				},
			},
		},
	}*/

	filter:=&map[string]interface{}{
		"Op.and": []interface{}{
			map[string]interface{}{
				//"hzfpxxqrdbh": map[string]interface{}{
					"Op.or": []interface{}{
						map[string]interface{}{
							"hzfpxxqrdbh": map[string]interface{}{
								"Op.eq": "",
							},
						},
						map[string]interface{}{
							"hzfpxxqrdbh": map[string]interface{}{
								"Op.is": nil,
							},
						},
					},
				//},
			},
			map[string]interface{}{
				"is_del": "0",
				"is_sales_list": "1",
				"sales_id": "%{globalFilterData.company_id.id}",
			},
	},}


	/*filter:=&map[string]interface{}{
		"Op.or": []interface{}{
			map[string]interface{}{
				"hzfpxxqrdbh": map[string]interface{}{
					"Op.eq": "",
				},
			},
			map[string]interface{}{
				"hzfpxxqrdbh": map[string]interface{}{
					"Op.is": nil,
				},
			},
		},
	}*/

	fields:=&[]Field{
		{
			Field: "id",
		},
	}
	modelID:="invoice"
	sWhere,errorCode:=FilterToSQLWhere(filter, fields, modelID)
	if errorCode!=common.ResultSuccess {
		fmt.Println(sWhere,errorCode)
		t.Errorf("FilterToSQLWhere failed")
	}
	fmt.Println(sWhere)
}