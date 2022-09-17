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
    "time"
    "log"
)

func main() {
    //设置log打印文件名和行号
    log.SetFlags(log.Lshortfile | log.LstdFlags)

    //初始化时区
    var cstZone = time.FixedZone("CST", 8*3600) // 东八
	time.Local = cstZone

    //初始化配置
    conf:=common.InitConfig()

    router := gin.Default()

    //router.Use(cors.Default())
    router.Use(cors.New(cors.Config{
        AllowAllOrigins:true,
        AllowHeaders:     []string{"*"},
        ExposeHeaders:    []string{"*"},
        AllowCredentials: true,
    }))

    appCache:=&common.DefatultAppCache{}
    appCache.Init(conf.Redis.Server,1)

    duration, _ := time.ParseDuration(conf.Redis.TokenExpired)
    loginCache:=&user.DefatultLoginCache{}
    loginCache.Init(conf.Redis.Server,conf.Redis.TokenDB,duration)
    
    router.Use(common.AuthMiddleware(loginCache,appCache))
    
    userRepo:=&user.DefatultUserRepository{}
    userRepo.Connect(
        conf.Mysql.Server,
        conf.Mysql.User,
        conf.Mysql.Password,
        conf.Mysql.DBName)

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
        conf.Mysql.DBName)
    dataController:=&data.DataController{
        DataRepository:dataRepo,
    }
    dataController.Bind(router)

    redirectController:=&redirect.RedirectController{}
    redirectController.Bind(router)

    flowExpired,_:=time.ParseDuration(conf.Redis.FlowInstanceExpired)
    flowInstanceRepository:=&flow.DefaultFlowInstanceRepository{}
    flowInstanceRepository.Init(conf.Redis.Server,conf.Redis.FlowInstanceDB,flowExpired)
    flowController:=&flow.FlowController{
        InstanceRepository:flowInstanceRepository,
        DataRepository:dataRepo,
    }
    flowController.Bind(router)

    //oauth
    oauthTokenExpired,_:=time.ParseDuration(conf.Redis.OauthTokenExpired)
    oauthCache:=&oauth.OAuthCache{}
    oauthCache.Init(conf.Redis.Server,conf.Redis.OauthTokenDB,oauthTokenExpired)
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

    router.Run(conf.Service.Port)
}