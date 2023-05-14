# 组件
* **mainframe**: 框架的主页面，包含了登录页、菜单栏、操作栏等基本的界面元素。主页面通过iframe可以加载框架中的其它功能页面或应用的定制页面。 主页面还实现了一套经过抽象的通用的操作方法，在iframe中打开的子页面可以通过发送消息的方式来调用主页面的这些操作方法。这些方法包括打开一个页面、调用一个后端的服务等，具体内容可以参照操作配置部分。

* **listview**: 框架提供的基础页面，用于在表格中展示数据库表中的数据，通过这个页面用户可以对数据库中的数据进行检索，可以打开表单创建或编辑数据。

* **formview**: 框架提供的基础表单页面，用于创建、编辑数据或查看数据详细信息。

* **report**: 框架提供的基础报表页面，可以图表的形式展示统计数据。报表使用了[echarts](https://echarts.apache.org)开源库进行图表的绘制。

* **service**: 框架的后台服务，采用go语言开发。 提供了对数据库中的数据进行各种操作的通用接口。目前仅支持MySQL数据库。


# 部署时依赖的其它软件
在部署crvframe前，需要先安装并运行以下软件:
  * Mysql
  * Redis


# crvframe的配置
crvframe建议使用容器运行，运行实例前需要先创建相应的目录并设置基本的配置参数。crvframe的配置文件目录结构如下：

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

crvframe框架的配置文件位于crvframe/conf目录下，名称为 conf.json. 其内容如下:

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
配置项及其含义说明如下:
## redis

  * **server**:redis 服务器地址，格式为 IP:PORT.
  * **password**:redis 服务器密码. 如果redis服务器没有密码，可以不设置这个参数。
  * **tokenExpired**:用户token的过期时间，如果用户在这个时间内没有在系统中做任何操作，则用户token将会失效。
  * **oauthTokenExpired**:crvframe提供了一个简单的oauth服务。这个参数用于配置oauth的token过期时间。
  * **tokenDB**:指定在redis中缓存用户登录token的数据库。
  * **oauthTokenDB**:指定在redis中缓存oauth token的数据库。
  * **appCacheDB**:指定在redis中缓存appid信息的数据库。
  * **flowInstanceDB**:这个参数已经不用了。
  * **flowInstanceExpired**:这个参数已经不用了。

## mysql
  * **server**:MYSQL 服务器地址，格式为 IP:PORT.
  * **user**:MYSQL 用户.
  * **password**: MYSQL 密码.
  * **dbName**:默认数据库。在运行crvframe前需要确保这个数据库存在，否则crvframe启动将失败。
  
    以下参数用于配置 Go [database/sql](https://pkg.go.dev/database/sql) 这个包，主要对数据库的连接进行优化控制。
  * **connMaxLifetime**:The maximum amount of time a connection may be reused.
  * **maxOpenConns**:The maximum number of open connections to the database.
  * **maxIdleConns**:The maximum number of connections in the idle connection pool.

## service
  * **port**:crvframe 后端服务监听地址，格式为 IP:PORT。这个参数一般不需要修改。

## file
  * **root**:crvframe 用于在服务器上存储附件、富文本等文件内容的主目录。

**create and put the conf.json file to the directory /root/crvframe/conf.**

# 运行crvframe
建议通过docker运行crvframe.

可使用以下命令启动 crvframe 实例:

``` 
#Replace the volume directory with the configuration directory you created earlier.
docker run -d --name crvframe -p80:80 -v /root/crvframe/appfile:/services/crvframe/appfile -v /root/crvframe/apps:/services/crvframe/apps -v /root/crvframe/conf:/services/crvframe/conf wangzhsh/crvframe:0.1.0
```

# 创建一个APP
crvframe 支持多个应用在一个实例上运行，每个应用拥有自己的数据库和相应的应用的配置。 

在一个实例上运行的每个应用都需要一个唯一的APPID。 当用户要访问一个APP时，需要在地址栏中填写带有APPID的URL，URL的格式如下:
    
    http://hostname:port/#/login/APPID.

下面将创建一个名称为demoapp的应用作为示例，这里为了简便使用应用的名称作为APPID,这里的APPID就是：**demoapp**。

## 在MySQL中创建这个APP对应的数据库
建议选择一个和APP含义相关的名称作为数据库的名字。在这里我们使用**demodb**作为数据库的名字。

## 初始化数据库
从这个代码库中找到文件/initapp/init_app_database.sql，这是一个初始化脚本，可用于初始化一个新创建的APP的数据库。
使用MySQL客户端工具链接到MySQL服务器，并在刚刚创建的数据中运行这个脚本完成初始化。

## 初始化应用的配置
在crvframe应用配置主目录下创建一个子目录用于存放刚刚创建的应用的配置。这个子目录的名字必须和应用的数据库的名字相同。 

这里我们通过如下命令在应用配置的主目录/root/crvframe/apps下创建名称为demodb的子目录:

    mkdir  /root/crvframe/apps/demodb

然后我们从本代码库中找到目录/initapp/init_app_conf，将这个目录下的所有内容复制到刚刚创建的目录下，注意是复制init_app_conf下的内容，不包含这个目录本身。

## 在Redis缓存中注册APP
使用Redis客户端工具连接到Redis服务器。选择APP缓存数据库（这个数据库在前面crvframe配置文件中指定），在数据库中增加以下键值信息：

**key**：
    
    appid:demoapp

**value**：
    
    demoadb

**note**：The key is prefixed with the fixed string appid，followed by a colon，then followed by the app id. The value is the database name of the app.

## 登录APP
使用以下地址登录这个APP:

    http://hostname/mainframe/#/login/demoapp

**note**：Replace the hostname with your real hostname or ip address. 

APP初始的默认的账号为 **admin**,密码和账号相同。


# 配置 APP

## 配置菜单

在crvframe的主目录下，找到目录apps/your_app_id/menus，在这个目录下应该有一个JSON文件，名称为menus.json。这个文件用于配置应用的菜单。文件的内容示例如下：


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


menus.json文件的内容是一个JSON数组, 数组的每个项目对应一个菜单项。

**配置参数的含义:**

  * **id** 菜单项的ID，在同一个菜单数据中，这个ID必须唯一。

  * **name** 菜单项目的名称，这个名称将显示在主界面的菜单栏中。

  * **description**  菜单的描述，可对菜单功能做简要说明。

  * **icon** 菜单名称前面显示的图标。crvframe使用antd组件实现前端页面, 这里的图标使用了and的icon控件，可以使用antd网站上的图标名称来配置菜单的图标。 antd图标的网址如下： 


    https://ant.design/components/icon


  * **children** 这里是一个子菜单项的数组。一个菜单项可以包含子菜单项，子菜单项又可以包含子菜单项，形成树形菜单结构。一个菜单如果拥有了子菜单则不能配置相应的操作和角色。.

  * **operation** 菜单项对应的操作，一般应配置为打开一个页面的操作。操作的配置请参照本文档中操作配置部分的说明。

  * **roles** 指定这个菜单项允许哪些角色访问，角色可以是一个字符串数组，数组中的每个项目对应一个角色的ID。如果只有一个角色也可以直接配置为角色的ID。如果设置为 "*" 则表示所有用户都可以访问这个菜单项。 


## 配置模型
一个模型一般对应应用中的一个实体，通常在应用的数据库中有一个表和这个模型对应。一个应用可以包含多个模型，并且在这些模型之间存在一定的关联关系。crvframe使用模型配置文件来配置应用的模型，通过这些配置crvframe的服务模块就知道应该怎么来操作这些模型对应的数据库表中的数据。

在crvframe的主配置目录中，找到目录apps/your_app_id/models，在这个目录下应该包含了一些子目录，每个子目录都对应了一个模型的配置。子目录的名字就是模型的名字，同时也是数据库表的名字。这里需要注意目录的名字中以core_开头的目录，这些目录是在APP初始创建时从crvframe的公共初始文件中复制过来的，是crvframe框架的一些支撑性模型配置，对这些配置的修改要格外小心，因为某些模型或字段在crvframe中有着特殊的作用，不能被删除或改变使用场景。 

### model.json文件
每个模型的目录中都包含了一个名称为model.json的文件，这个文件中包含了模型本身的配置信息。以下是一个模型配置的样例：


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


这个样例是模型core_user的配置，在应用的数据库中应该存在一个同名的表。

**各配置项的含义说明:**

  * **modelID** 模型的ID，同时也是模型对应的数据库表的名称。

  * **fields** 模型包含的字段的数组，每个字段包含的属性如下：

    * **field** 字段的名称。

    * **name** 页面中显示字段时使用的名字，可能是表格的标题栏或者文本输入框前的标题。

    * **dataType** 字段数据类型，到目前为止crvframe支持的数据类型包括： varchar、int、datetime、decimal。

    * **fieldType** 字段类型，仅对关联字段有效，用于表示关联的类型。如果当前字段需要关联到应用中的另一个模型，则这个字段可以配置为关联字段。crvframe支持的关联类型包括: one2many(一对多)、many2one(多对一)、many2many（多对多）.

    * **relatedModelID** 仅对关联字段有效，表示关联字段关联到的应用的另一个模型的ID。

    * **relatedField**  仅对one2many关联字段有效，表示对应模型中的many2one字段的ID。每个one2many字段应该在对应的relatedModelID模型中有一个many2one字段。one2many字段实际上是一个虚拟字段，在数据库表中并没有这个字段，这个字段只是用于告诉crvframe这里有一个相应的关联关系。

    * **AssociationModelID** 仅对many2many关联字段有效，用于指定中间表对应的模型ID。如果不设置设置属性，crvframe将使用字符串升序将本模型ID和relatedModelID进行拼接来作为中间表的模型ID，在拼接时将在两个模型中间插入一个下划线来避免冲突。  
    
    * **quickSearch**  指示字段是否用于快速检索。

### 配置模型的操作
在模型的配置目录下有一个名称为operations的子目录，这个目录中一般包含多个JSON文件，每个文件都是针对模型的一个操作的配置，文件名称就是操作的ID。以下是初始应用中core_user模型的操作create的配置内容：


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


**各配置项的含义如下:**

  * **id** 操作的ID，应该和文件名称一致。

  * **name** 当在页面中显示这个操作对应的按钮时，按钮上默认显示的文字。

  * **type** 操作的类型。crvframe中目前支持的所有操作的类型将在下一个章节中逐一说明。

  * **params** 操作的参数，不同类型的操作的参数是不一样的，每种类型操作的参数将在下一个章节中说明。

  * **input** 操作的输入数据。这个参数是可选的，一般不需要指定这个参数，在一个系列连续的操作中，crvframe将使用前一个操作的结果作为后一个操作的输入。  

  * **description** 对操作的描述，这个文字将显示在页面的操作提示对话框中。

  * **successOperation** 如果操作执行成功，则将继续执行successOperation对应的操作，successOperation本身也是一个操作。通过successOperation，可以实现一个操作序列的配置。

  * **errorOperation**  如果操作执行失败，则将执行errorOperation对应的操作。 errorOperation本身也是一个操作，一般是不需要配置这个属性的，如果操作执行失败，crvframe默认会将操作的错误信息提示给用户。

**Operation Types:**
  * **open**
    * **description**: open a web page.
    * **parameters**: 
      ```
      {
        "params":{
          "url":"/listview/#/core_user",
          "location":"tab",
          "title":"",
          "key":"/model/core_user",
          "view":"currentView",
          "filter":"init filter",
        },
      }
      ```
      * **url** URL of the page to open. crvframe supplies three basic pages that can be used to present or edit data. 
        * **listview**  The listview present data in a table and are used to explore or search for data in the model. The URL of a listview page begins with /listview/#/ followed by the id of the model. The example above opens a listview of the model with id core_user.
        * **formview** The formview used to create、edit or view a single record of a model. The URL of a formview page begins with /formview/#/ followed by the id of the model and the id of the form and the type of the form。 
          ```          
          //this url is used to open a formview of the model core_user. the id of the form is form1 and the type of the form is create. 
          /formview/#/core_user/form1/create
          ```
          crvframe support three form types:
          * **create** Used to input new record of a model.
          * **edit** Used to edit the existed record of a model.
          * **detail** Used to view the detail of a record of a model.You can not edit any data in this type of forms.
        * **report** The report used to view statistical charts.The URL of a report page begins with /report/#/ followd by the id the the report. 
          ```          
          //this url is used to open a report page. the id of the report is dashboard. 
          /report/#/dashboard
          ```
      * **location** Where to open the page. crvframe support two locations to show the page:
        * **tab** Open the page in the tab content area below the header bar of the main window.
        * **modal** Open a modal window to show the page. 
      * **title** The tile of the page.
      * **key** The key of the page, which other operations can use to refer to the page.
      * **view** Each model in a crvframe can have multiple views, and when you use a listview to display the model's data, the first view is displayed by default.You can use this parameter to set the default view that is displayed.The value of this parameter is the id of the view. This parameter is optional and valid only for listview.
      * **filter** Used to set the initial filter of the listview.This parameter is optional and valid only for listview.
    * **input** When the operation is invoked through a button on a crvframe page, the input is populated by the page.In some cases,you can set the input in operation configuations.
      * When open a formview with the type of create to create a record of the model, you can set the input value as the initial value of the new record.
        ```
        {
          "input":{
            "list":[{"gender":"female"}]
          },
        }
        ```
        **note** The input value must be placed in an array called list.The input value is an object, each key is a field of the model, and the value is the value to update.The example above set the default value of the gender field to female.    

  * **close**
    * **description**: close a web page.
    * **parameters**: 
      ```
      {
        "params":{
          "location":"modal",
        },
      }
      ```
      * **location** Now，crvframe can only close the top most modal window，so the location must be modal.
  * **request**
    * **description**: send a http request.
    * **parameters**:
      ```
      {
        "params":{
          "url":"/data/save",
          "method":"post"
        },
      }
      ```
      * **url** The destination url of the the http request.crvframe supplies following interfaces for operation on the model's data. 
        * **/data/query** Query data from the database.crvframe's listview use this interface to retrieve data.This interface use post method.
        * **/data/save** Save the model's data into the database.This interface use post method.
        * **/data/delete** Delete the records of models from the database by conditions.This interface use post method.
        * **/data/update** Update values of records of models to the database by conditions.This interface use post method.
        * **/redirect** To invoke the external api，you can use redirect interface.
      * **method** The method of the http request.
    * **input** When the operation is invoked through a button on a crvframe page, the input is populated by the page.In some cases,you can set the input in operation configuations.   
      * When you want to use /data/update interface to update the values of some records to fixed values,you can set input in configuration to the fixed values. 
        The belowing example updates the value of the gender field to female.
        ```
        {
          "input":{
            "list":[{"gender":"female"}]
          },
        }
        ```
        **note** The input value must be placed in an array called list.The input value is an object, each key is a field of the model, and the value is the value to update.
      
      * When you use redirect interface to invoke the external api,you can supply the id of the external api in input with the key of to.
        ```
          {
            "input":{
              "to":"external_api_id",
              "other_key":"other_value",
            },
          }
        ```
        **note** You can set other keys and values in input, before sending the http request crvframe will merge the value of input and the value of the page,so these values will send to the api.If the key of the input value is the same as the key of the page value,thie value of input will be overwritten by the value of the page.
      
  * **reloadFrameData**

  * **logout**

  * **message**

  * **downloadFile**



  

      


   








