package common

import "net/http"

type CommonRsp struct {
	ErrorCode int `json:"errorCode"`
	Message string `json:"message"`
	Error bool `json:"error"`
	Result interface{} `json:"result"`
}

type CommonResult struct {
	Rsp *CommonRsp
	Status int
}

const (
	ResultSuccess = 10000000
	ResultWrongRequest = 10000001
	ResultWrongUserPassword = 10000002
	ResultCreateTokenError = 10000003
	ResultTokenExpired = 10000004
	ResultAccessDBError = 10000005
	ResultOpenFileError = 10000006
	ResultJsonDecodeError = 10000007
	ResultAppDBError=10000008
	ResultSQLError=10000009
	ResultQueryFieldNotFound=10000010
	ResultQueryWrongPagination=10000011
	ResultNotSupported=10000012
	ResultQueryWrongFilter=10000013
	ResultModelFormNotFound=10000014
	ResultNotSupportedSaveType=10000015
	ResultNotSupportedValueType=10000016
	ResultNoIDWhenUpdate=10000017
	ResultNoVersionWhenUpdate=10000018
	ResultDuplicatePrimaryKey=10000019
	ResultWrongDataVersion=10000020
	ResultNoIDWhenDelete=10000021
	ResultNoRelatedModel=10000022
	ResultNoRelatedField=10000023
	ResultNotSupportedFieldType=10000024
	ResultNoFileNameWhenCreate=10000025
	ResultNoFileContentWhenCreate=10000026
	ResultCreateDirError=10000027
	ResultBase64DecodeError=10000028
	ResultCreateFileError=10000029
	ResultReadDirError=10000030
	ResultPostExternalApiError=10000031
	ResultNoExternalApiId=10000032
	ResultNoExternalApiUrl=10000033
	ResultNoUserRole=10000034
	ResultNoPermission=10000035
	ResultNotDeleteData=10000036
	ResultUpdateFieldNotFound=10000037
	ResultI18nNoLangList=10000038
	ResultI18nNoLang=10000039
	ResultStartFlowWithoutID=20000001
	ResultCacheFlowInstanceError=20000002
	ResultNoExecutorForNodeType=20000003
	ResultNoNodeOfGivenID=20000004
	ResultPushFlowWithoutID=20000005
	ResultLoadFlowInstanceError=20000006
)

var errMsg = map[int]CommonResult{
	ResultSuccess:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultSuccess,
			Message:"操作成功",
			Error:false,
		},
		Status:http.StatusOK,	
	},
	ResultWrongRequest:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultWrongRequest,
			Message:"请求参数错误，请检查参数是否完整，参数格式是否正确",
			Error:true,
		},
		Status:http.StatusBadRequest,	
	},
	ResultWrongUserPassword:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultWrongUserPassword,
			Message:"账号或密码错误",
			Error:true,
		},
		Status:http.StatusBadRequest,	
	},
	ResultCreateTokenError:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultCreateTokenError,
			Message:"生成登录令牌时发生错误，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultTokenExpired:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultTokenExpired,
			Message:"账号过期，请重新登录系统后再次尝试",
			Error:true,
		},
		Status:http.StatusBadRequest,	
	},
	ResultAccessDBError:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultAccessDBError,
			Message:"访问数据库时发生错误，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultOpenFileError:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultOpenFileError,
			Message:"打开配置文件时发生错误，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultJsonDecodeError:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultJsonDecodeError,
			Message:"解析JSON文件时发生错误，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultAppDBError:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultAppDBError,
			Message:"获取APP相关信息错误，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultSQLError:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultSQLError,
			Message:"执行查询语句时发生错误，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultQueryFieldNotFound:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultQueryFieldNotFound,
			Message:"执行查询请求中没有提供查询字段信息，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultQueryWrongPagination:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultQueryWrongPagination,
			Message:"执行查询请求中提供的分页信息不正确，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNotSupported:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNotSupported,
			Message:"遇到不支持的过滤条件格式，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultQueryWrongFilter:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultQueryWrongFilter,
			Message:"执行查询请求中提供的过滤信息不正确，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultModelFormNotFound:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultModelFormNotFound,
			Message:"获取表单定义时没有找到对应的表单，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNotSupportedSaveType:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNotSupportedSaveType,
			Message:"保存数据请求中提供的保存操作类型不正确，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNotSupportedValueType:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNotSupportedValueType,
			Message:"保存数据请求中提供的字段值类型不支持，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNoIDWhenUpdate:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNoIDWhenUpdate,
			Message:"更新或删除数据请求中缺少ID字段，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNoVersionWhenUpdate:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNoVersionWhenUpdate,
			Message:"更新数据请求中缺少Version字段，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultDuplicatePrimaryKey:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultDuplicatePrimaryKey,
			Message:"创建数据时发现关键字重复，数据库不能创建新的记录",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultWrongDataVersion:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultWrongDataVersion,
			Message:"您没有修改数据的权限或数据已被其他用户修改，请刷新页面数据后重新尝试",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNoIDWhenDelete:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNoIDWhenDelete,
			Message:"删除数据的请求中没有提供ID信息，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNoRelatedModel:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNoRelatedModel,
			Message:"关联字段中没有配置对应的关联数据模型，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNoRelatedField:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNoRelatedField,
			Message:"一对多关联字段中没有配置对应的关联字段，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNotSupportedFieldType:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNotSupportedFieldType,
			Message:"保存数据时遇到不支持的字段类型，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNoFileNameWhenCreate:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNoFileNameWhenCreate,
			Message:"保存文件时缺少文件名称参数，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNoFileContentWhenCreate:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNoFileContentWhenCreate,
			Message:"保存文件时缺少文件内容参数，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultCreateDirError:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultCreateDirError,
			Message:"保存文件时创建文件夹失败，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultBase64DecodeError:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultBase64DecodeError,
			Message:"保存文件时文件内容Base64解码失败，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultCreateFileError:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultBase64DecodeError,
			Message:"创建文件失败，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultReadDirError:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultReadDirError,
			Message:"访问文件夹时发生错误，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultPostExternalApiError:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultPostExternalApiError,
			Message:"调用外部API失败，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNoExternalApiId:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNoExternalApiId,
			Message:"调用外部API时为提供API标识，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNoExternalApiUrl:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNoExternalApiUrl,
			Message:"调用外部API时缺少API配置，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNoUserRole:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNoUserRole,
			Message:"当前用户尚未分配角色权限，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNoPermission:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNoPermission,
			Message:"您没有权限完成当前数据操作，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultNotDeleteData:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNotDeleteData,
			Message:"删除数据失败，数据不存在或您没有权限删除相应数据",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultUpdateFieldNotFound:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultUpdateFieldNotFound,
			Message:"更新数据失败，未指定需要更新的字段",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultI18nNoLangList:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultI18nNoLangList,
			Message:"获取语言资源错误，未定义系统支持的语言种类",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultI18nNoLang:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultI18nNoLang,
			Message:"获取语言资源错误，未找到对应语言翻译",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultStartFlowWithoutID:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultStartFlowWithoutID,
			Message:"在执行Flow时没有提供Flow的ID，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,	
	},
	ResultCacheFlowInstanceError:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultCacheFlowInstanceError,
			Message:"缓存Flow实例数据出错，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,
	},
	ResultNoExecutorForNodeType:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNoExecutorForNodeType,
			Message:"执行流时遇到不支持的节点类型，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,
	},
	ResultNoNodeOfGivenID:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultNoNodeOfGivenID,
			Message:"执行流时找不到对应ID的节点，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,
	},
	ResultPushFlowWithoutID:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultPushFlowWithoutID,
			Message:"执行流时未提供流的实例ID，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,
	},
	ResultLoadFlowInstanceError:CommonResult{
		Rsp:&CommonRsp{
			ErrorCode:ResultLoadFlowInstanceError,
			Message:"执行流时加载流实例失败，请与管理员联系处理",
			Error:true,
		},
		Status:http.StatusInternalServerError,
	},
}

func CreateResponse(errorCode int,result interface{})(*CommonResult){
	commonResult:=errMsg[errorCode]
	commonResult.Rsp.Result=result
	return &commonResult
}