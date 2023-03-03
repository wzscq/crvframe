# crvframe
A lowcode framework for CRUD applications. You simply create configuration files in JSON format to build your application. 

# Components
* **mainframe**: A front-end main component of the framework, It contains the common UI functions of a application, login page、application menus etc. It uses iframe to load other front-end components or custom pages. It provides a group of abstraction operation API for other front-end pages to interact with back-end services and other front-end pages.

* **listview**: A front-end component of the framework used to retrieve data and show the data in table.

* **formview**: A front-end component of the framework used to create or update data. It can also be used to view the detail of the data.

* **report**: A front-end component of the framework used to show data with charts.It uses [echarts](https://echarts.apache.org) to create the data charts.

* **service**: Back-end service of the fromework write with golang. It provides APIs to manipulation data in database.
Currently, only MySQL is supported.

# Dependencies
Before install and run crvframe,you must install and run these softwares:
  * Mysql
  * Redis


# Configurations
Before run the docker instance，create the directories for configuration files.

```
#create root directory of crvframe configurations, you can use any other dirctory as the root directory.
mkdir  /root/crvframe
#create a sub directory to store attaches or temp files.
mkdir  /root/crvframe/appfile
#create a sub directory to store application conifiguration files.
mkdir  /root/crvframe/apps 
#create a sub directory to store the configuration file of the crvframe itself.
mkdir  /root/crvframe/conf 
```

the configuration file of the crvframe itself is named conf.json. Its content is:

``` 
{
    "redis":{
        "server":"127.0.0.1:6379",
        "tokenExpired":"6000s",
        "oauthTokenExpired":"60s",
        "tokenDB":0,
        "oauthTokenDB":4,
        "appCacheDB":1,
        "flowInstanceDB":2,
        "flowInstanceExpired":"0s"
        "password":""
    },
    "mysql":{
        "server":"127.0.0.1:3306",
        "password":"",
        "user":"",
        "dbName":"",
        "connMaxLifetime":60,
        "maxOpenConns":10,
        "maxIdleConns":10
    },
    "service":{
        "port":"127.0.0.1:8200"
    },
    "file":{
        "root":"appfile"
    }
}
``` 
The meaning of the configuration items:
## redis

  * **server**:The redis server address with format of IP:PORT.
  * **password**:The redis server auth password. This item is optional.
  * **tokenExpired**:How long to keep the user token after the last user operation.
  * **oauthTokenExpired**:The crvframe provides a simple oauth server. This configuration item is used for oauth token.
  * **tokenDB**:Which DB of the redis is used to store login token.
  * **oauthTokenDB**:Which DB of the redis is used to store oauth login token.
  * **appCacheDB**:Which DB of the redis is used to store application ID.
  * **flowInstanceDB**:deprecate soon later.
  * **flowInstanceExpired**:deprecate soon later.

## mysql
  * **server**:The MYSQL server address with format of IP:PORT.
  * **user**:The MYSQL server auth user.
  * **password**:The MYSQL server auth password.
  * **dbName**:The default MYSQL database for connection. This database must be exist before the crvframe can be run.
  
    The flowing items are parameters of Go [database/sql](https://pkg.go.dev/database/sql) package.
  * **connMaxLifetime**:The maximum amount of time a connection may be reused.
  * **maxOpenConns**:The maximum number of open connections to the database.
  * **maxIdleConns**:The maximum number of connections in the idle connection pool.

## service
  * **port**:The crvframe service address with format of IP:PORT.

## file
  * **root**:The root directory for crvframe service to store files.

**create and put the conf.json file to the directory /root/crvframe/conf.**

# Run
We recomend run crvframe with docker.

run docker instance using:

``` 
#Replace the volume directory with the configuration directory you created earlier.
docker run -d --name crvframe -p80:80 -v /root/crvframe/appfile:/services/crvframe/appfile -v /root/crvframe/apps:/services/crvframe/apps -v /root/crvframe/conf:/services/crvframe/conf wangzhsh/crvframe:0.1.0
```

# Create your first app
The crvframe support multi apps in same running instance.Each app has its own database and configuration files. 

Each app has a unique APPID. To access to a app, user must use the app access URL which contain the APPID.The form of the app access URL is:
    
    http://hostname:port/#/login/APPID.

Let's create a app named demoapp,we will use the name as APPID,so the APPID is **demoapp**.

## Create app database in MySQL
Choose a meaningful name for the database of the app.Here we create a database with name **demodb**.

## Init app database
From this code repository,find the file /initapp/init_app_database.sql, this is the init script for crvframe app database.
Use MySQL client to connect to the MySQL server, use the database **demodb** created last step.
Run this init script in **demodb** database.

## Create app configuration
In the directory of application conifiguration files,create the a sub directory for the app. 

The directory name must be the same as the app database name. 

For this guid, we create a sub directory named demodb in /root/crvframe/apps:

    mkdir  /root/crvframe/apps/demodb

From this code repository,find the folder /initapp/init_app_conf, copy all of the files and sub folders in the folder to the app configuration directory /root/crvframe/apps/demodb.

## Register your app in redis app cache DB
Use redis clinet tool to connect to the redis server. Choose the app cache DB which setted with conf.json.Add following key values to the DB.

**key**：
    
    appid:demoapp

**value**：
    
    demoadb

**note**：The key is prefixed with the fixed string appid，followed by a colon，then followed by the app id. The value is the database name of the app.

## Sign in
Use following url to open login page of your app:

    http://hostname/mainframe/#/login/demoapp

**note**：Replace the hostname with your real hostname or ip address. 

The defalut account of the app is **admin**,the password is the same as the account.


# Config Your APP

## Add Menu Items

In the root directory of the crvframe configuration created at deployment time, locate the subdirectory apps/your_app_id/menus. There should be a JSON file menus.json. You can use this file to configure the app's menu. The contents of this file are shown below：


    [
      {
        "id":"100",
        "name":"系统管理",
        "description":"系统管理相关功能",
        "icon":"SettingOutlined",
        "children":[
          {
            "id":"1",
            "name":"用户管理",
            "description":"维护系统登录账号",
            "icon":"UserOutlined",
            "operation":{
              "type":"open",
              "params":{
                  "url":"/listview/#/core_user",
                  "location":"tab",
                  "title":"用户管理",
                  "key":"/model/core_user"
              },
              "input":{},
              "description":"打开用户管理功能"
            },
            "roles":"admin"
          }
        ]
      }
    ]


The content of menus.json is a JSON array, each item of the array is a menu item.

**The meaning of each item:**
**id** The ID of the menu item in the menu array, which must be unique.
**name** The name of the menu, which appears on the menu bar on the main page of the app.
**description**  This item is used to describe the function of the menu item.
**icon** The menu icon, which appears to the left of the menu name.The crvframe uses the antd component, and the icon name can be found on the antd web page below: 


    https://ant.design/components/icon









