package main

import (
	"crv/frame/cas"
	"crv/frame/common"
	"crv/frame/data"
	"crv/frame/definition"
	"crv/frame/esi"
	"crv/frame/flow"
	crvlog "crv/frame/log"
	"crv/frame/oauth"
	"crv/frame/operationlog"
	"crv/frame/redirect"
	"crv/frame/report"
	"crv/frame/user"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	sloggin "github.com/samber/slog-gin"
	"log"
	"log/slog"
	"os"
	"runtime"
	"time"
)

func main() {
	confFile := "conf/conf.json"
	if len(os.Args) > 1 {
		confFile = os.Args[1]
		slog.Info(confFile)
	}
	//初始化配置
	conf := common.InitConfig(confFile)
	//设置启动线程数量
	if conf.Runtime.GoMaxProcs > 0 {
		runtime.GOMAXPROCS(conf.Runtime.GoMaxProcs)
	}

	crvlog.InitCRVLog(&conf.Log)
	slog.Info("crvframe service start...")

	//设置log打印文件名和行号
	log.SetFlags(log.Lshortfile | log.LstdFlags)

	//初始化时区
	var cstZone = time.FixedZone("CST", 8*3600) // 东八
	time.Local = cstZone

	router := gin.Default()

	router.Use(sloggin.New(slog.Default()))

	//router.Use(cors.Default())
	router.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"*"},
		AllowCredentials: true,
	}))

	appCache := &common.DefatultAppCache{}
	appCache.Init(conf.Redis.Server, conf.Redis.AppCacheDB, conf.Redis.Password, conf.Redis.TLS)

	duration, _ := time.ParseDuration(conf.Redis.TokenExpired)
	loginCache := &user.DefatultLoginCache{}
	loginCache.Init(conf.Redis.Server, conf.Redis.TokenDB, duration, conf.Redis.Password, conf.Redis.TLS)

	router.Use(common.AuthMiddleware(loginCache, appCache))

	//初始化operationlog相关配置
	operationlog.Init(router, &conf.OperationLog.FileOptions, conf.OperationLog.Apps)

	userRepo := &user.DefatultUserRepository{}
	userRepo.Connect(
		conf.Mysql.Server,
		conf.Mysql.User,
		conf.Mysql.Password,
		conf.Mysql.DBName,
		conf.Mysql.ConnMaxLifetime,
		conf.Mysql.MaxOpenConns,
		conf.Mysql.MaxIdleConns,
		conf.Mysql.TLS)

	userController := &user.UserController{
		UserRepository: userRepo,
		LoginCache:     loginCache,
		AppCache:       appCache,
		LoginLogApps:   conf.LoginLog.Apps,
	}
	userController.Bind(router)

	defController := &definition.DefinitionController{}
	defController.Bind(router)

	dataRepo := &data.DefatultDataRepository{}
	dataRepo.Connect(
		conf.Mysql.Server,
		conf.Mysql.User,
		conf.Mysql.Password,
		conf.Mysql.DBName,
		conf.Mysql.ConnMaxLifetime,
		conf.Mysql.MaxOpenConns,
		conf.Mysql.MaxIdleConns,
		conf.Mysql.TLS)

	//增加大文件一步下载支持
	downloadCacheExpired, _ := time.ParseDuration(conf.Redis.DownloadCacheExpired)
	downloadCache := &data.DefatultDownloadCache{}
	downloadCache.Init(conf.Redis.Server, conf.Redis.DownloadCacheDB, downloadCacheExpired, conf.Redis.Password, conf.Redis.TLS)
	downloadHandler := &data.DownloadHandler{
		DownloadCache: downloadCache,
	}

	//增加上传文件支持
	uploadCacheExpired, _ := time.ParseDuration(conf.Redis.UploadCacheExpired)
	uploadCache := &data.DefatultUploadCache{}
	uploadCache.Init(conf.Redis.Server, conf.Redis.UploadCacheDB, uploadCacheExpired, conf.Redis.Password, conf.Redis.TLS)

	uploadHandler := &data.UploadHandler{
		UploadCache: uploadCache,
	}

	dataController := &data.DataController{
		DataRepository:  dataRepo,
		UploadHandler:   uploadHandler,
		DownloadHandler: downloadHandler,
	}
	dataController.Bind(router)

	redirectController := &redirect.RedirectController{}
	redirectController.Bind(router)

	flowExpired, _ := time.ParseDuration(conf.Redis.FlowInstanceExpired)
	flowInstanceRepository := &flow.DefaultFlowInstanceRepository{}
	flowInstanceRepository.Init(conf.Redis.Server, conf.Redis.FlowInstanceDB, flowExpired, conf.Redis.Password, conf.Redis.TLS)
	flowController := &flow.FlowController{
		InstanceRepository: flowInstanceRepository,
		DataRepository:     dataRepo,
	}
	flowController.Bind(router)

	//oauth
	oauthTokenExpired, _ := time.ParseDuration(conf.Redis.OauthTokenExpired)
	oauthCache := &oauth.OAuthCache{}
	oauthCache.Init(conf.Redis.Server, conf.Redis.OauthTokenDB, oauthTokenExpired, conf.Redis.Password, conf.Redis.TLS)
	oauthController := &oauth.OAuthController{
		AppCache:       appCache,
		UserRepository: userRepo,
		OAuthCache:     oauthCache,
		LoginCache:     loginCache,
		LoginLogApps:   conf.LoginLog.Apps,
	}
	oauthController.Bind(router)

	//cas
	casController := &cas.CasController{
		CasUrl: conf.Cas.Url,
	}
	casController.Bind(router)

	//esi
	esiController := &esi.EsiController{
		DataRepository: dataRepo,
	}
	esiController.Bind(router)

	//report
	reportController := &report.ReportController{
		DataRepository: dataRepo,
	}
	reportController.Bind(router)

	slog.Info("crvframe service listening and serving HTTP on :" + conf.Service.Port)
	router.Run(conf.Service.Port)
}
