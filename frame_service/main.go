package main

import (
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
	"crv/frame/user"
    "crv/frame/definition"
    "crv/frame/data"
    "crv/frame/common"
    "crv/frame/redirect"
    "crv/frame/flow"
    "time"
    "log"
)

func main() {
    //设置log打印文件名和行号
    log.SetFlags(log.Lshortfile | log.LstdFlags)
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
    loginCache.Init(conf.Redis.Server,0,duration)
    
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

    flowInstanceRepository:=&flow.DefaultFlowInstanceRepository{}
    flowInstanceRepository.Init(conf.Redis.Server,2,0)
    flowController:=&flow.FlowController{
        InstanceRepository:flowInstanceRepository,
    }
    flowController.Bind(router)

    router.Run(conf.Service.Port)
}