package main

import (
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
	"crv/frame/user"
    "crv/frame/definition"
    "crv/frame/data"
    "crv/frame/common"
    "crv/frame/oauth"
    "crv/frame/redirect"
    "crv/frame/flow"
    "crv/frame/esi"
    "crv/frame/report"
    "time"
    "log"
    "os"
)

func main() {
    //设置log打印文件名和行号
    log.SetFlags(log.Lshortfile | log.LstdFlags)

    //初始化时区
    var cstZone = time.FixedZone("CST", 8*3600) // 东八
	time.Local = cstZone

    confFile:="conf/conf.json"
    if len(os.Args)>1 {
        confFile=os.Args[1]
        log.Println(confFile)
    }

    //初始化配置
    conf:=common.InitConfig(confFile)

    router := gin.Default()

    //router.Use(cors.Default())
    router.Use(cors.New(cors.Config{
        AllowAllOrigins:true,
        AllowHeaders:     []string{"*"},
        ExposeHeaders:    []string{"*"},
        AllowCredentials: true,
    }))

    appCache:=&common.DefatultAppCache{}
    appCache.Init(conf.Redis.Server,conf.Redis.AppCacheDB,conf.Redis.Password)

    duration, _ := time.ParseDuration(conf.Redis.TokenExpired)
    loginCache:=&user.DefatultLoginCache{}
    loginCache.Init(conf.Redis.Server,conf.Redis.TokenDB,duration,conf.Redis.Password)

    router.Use(common.AuthMiddleware(loginCache,appCache))
    
    userRepo:=&user.DefatultUserRepository{}
    userRepo.Connect(
        conf.Mysql.Server,
        conf.Mysql.User,
        conf.Mysql.Password,
        conf.Mysql.DBName,
        conf.Mysql.ConnMaxLifetime,
        conf.Mysql.MaxOpenConns,
        conf.Mysql.MaxIdleConns)

	userController:=&user.UserController{
        UserRepository:userRepo,
        LoginCache:loginCache,
        AppCache:appCache,
    }
    userController.Bind(router)
    
    defController:=&definition.DefinitionController{}
    defController.Bind(router)

    dataRepo:=&data.DefatultDataRepository{}
    dataRepo.Connect(
        conf.Mysql.Server,
        conf.Mysql.User,
        conf.Mysql.Password,
        conf.Mysql.DBName,
        conf.Mysql.ConnMaxLifetime,
        conf.Mysql.MaxOpenConns,
        conf.Mysql.MaxIdleConns)
    dataController:=&data.DataController{
        DataRepository:dataRepo,
    }
    dataController.Bind(router)

    redirectController:=&redirect.RedirectController{}
    redirectController.Bind(router)

    flowExpired,_:=time.ParseDuration(conf.Redis.FlowInstanceExpired)
    flowInstanceRepository:=&flow.DefaultFlowInstanceRepository{}
    flowInstanceRepository.Init(conf.Redis.Server,conf.Redis.FlowInstanceDB,flowExpired,conf.Redis.Password)
    flowController:=&flow.FlowController{
        InstanceRepository:flowInstanceRepository,
        DataRepository:dataRepo,
    }
    flowController.Bind(router)

    //oauth
    oauthTokenExpired,_:=time.ParseDuration(conf.Redis.OauthTokenExpired)
    oauthCache:=&oauth.OAuthCache{}
    oauthCache.Init(conf.Redis.Server,conf.Redis.OauthTokenDB,oauthTokenExpired,conf.Redis.Password)
    oauthController:=&oauth.OAuthController{
        AppCache:appCache,
        UserRepository:userRepo,
        OAuthCache:oauthCache,
        LoginCache:loginCache,
    }
    oauthController.Bind(router)

    //esi
    esiController:=&esi.EsiController{
        DataRepository:dataRepo,
    }
    esiController.Bind(router)

    //report
    reportController:=&report.ReportController{
        DataRepository:dataRepo,
    }
    reportController.Bind(router)

    router.Run(conf.Service.Port)
}