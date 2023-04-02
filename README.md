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

## Config Menu Items

In the root directory of the crvframe configuration created at deployment time, locate the subdirectory apps/your_app_id/menus. There should be a JSON file menus.json. You can use this file to configure the app's menu. The example of the contents of this file are shown below：


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

  * **id** The ID of the menu item in the menu array, which must be unique.

  * **name** The name of the menu, which appears on the menu bar on the main page of the app.

  * **description**  This item is used to describe the function of the menu item.

  * **icon** The menu icon, which appears to the left of the menu name.The crvframe uses the antd component, and the icon name can be found on the antd web page below: 


    https://ant.design/components/icon


  * **children** The parent menu has a child list, the list is a json array, and each item of the array is a menu item, submenu items can also have submenu items. the parent menu item can not have operation and roles.

  * **operation** The action of the menu item. For more information on how to configure operations, see the Operations paragraph in this readme.

  * **roles** It indicates which roles can see the menu item. The roles can be a array of string, each item is a role ID. The roles can also be a string that indicates only one role can see the menu item. If the value of roles is "*"，all roles of the app can see the menu item. 


## Config Models
A model is a entity of the app, it typically has a corresponding table in the app's database. An app often has multiple models. The models of the app has multiple relationships to each other. The crvframe use model configuration files to configure the application's models, through which the crvframe service knows how to show and manipulate the data in the database.

In the root directory of the crvframe configuration created at deployment time, locate the subdirectory apps/your_app_id/models folder. There should already have some sub folders. Each folder is a model, the
 folder name is the model name. Attention the folders with the name start with core_, these folders are initial models of the app used by the crvframe itsself, and you must be carefully when modifying these model configuration files. 

### model.json
Each model folder contains a file named model.json, which contains configuration about the model. An example of model.json is shown below：


    {
      "modelID": "core_user",
      "fields": [
        {"field": "id", "name": "ID", "dataType": "varchar"}, 
        {"field": "user_name_en", "name": "英文名称", "dataType": "varchar","quickSearch":true}, 
        {"field": "user_name_zh", "name": "中文名称", "dataType": "varchar","quickSearch":true}, 
        {"field": "password", "name": "密码", "dataType": "password"}, 
        {"field": "create_time", "name": "创建时间", "dataType": "datetime"}, 
        {"field": "create_user", "name": "创建人", "dataType": "varchar"}, 
        {"field": "update_time", "name": "更新时间", "dataType": "datetime"}, 
        {"field": "update_user", "name": "更新人", "dataType": "varchar"}, 
        {"field": "remark", "name": "备注", "dataType": "varchar","quickSearch":true}, 
        {"field": "version", "name": "数据版本", "dataType": "int"},
        {"field": "user_role","name": "用户角色","fieldType":"many2many","relatedModelID":"core_role"}
      ]
    }


This example is the configuration of the core_user model, and there should be a corresponding table named core_user in the app's database.

**The meaning of each item:**

  * **modelID** The idendtification of the model, which is also the table name of the model.

  * **fields** The array of model fields. Eache field has following attributes:

    * **field** The name of the field.

    * **name** The label of the field on the web.

    * **dataType** The value type of the field, currently, the crvframe support these types: varchar、int、datetime、decimal.

    * **fieldType** Applies only to relationship fields and represents the relationship type. If the field is referenced to another model or by annother model, the field is the relationship field.crvframe support three relationship types: one2many、many2one、many2many.

    * **relatedModelID** Applies only to relationship fields to indicate the referenced model.

    * **relatedField** Applies only to one2many fields to indicate the related many2one field. Each one2many filed should has a corresponding many2one field in the related model. The one2many field is dummy and there is no actual field in the database table, which is only used by crvframe to identify relationships of models.

    * **AssociationModelID** Applies only to many2many fields to indicate the association model. If this attribute is not set, crvframe uses literal ascending sort to connect modelID and relatedModelID the AssociationModelID, and there is a _ as separator between modleID and relatedModelID.  
    
    * **quickSearch**  This attribete indicates whether the field is used as a quick search field. When a user performs a quick search on a list view, all quick search fields are searched.

### Config Model Operations
Each model folder contains a subfolder called operations that contains JSON files, each of which is an operation configuration file with a file name that is the operation ID.An example of operation configuration file is shown below：


    {
      "id": "create", 
      "name": "创建",
      "type":"open",
      "params":{
          "url":"/formview/#/core_user/form1/create",
          "location":"modal",
          "title":"创建用户",
          "key":"/model/core_user/form1/create",
          "width":800,
          "height":440
      },
      "input":{},
      "description":"打开创建用户对话框"
    }





      


   








