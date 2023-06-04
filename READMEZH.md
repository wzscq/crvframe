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
    * **description**: 打开一个页面。
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
      * **url** 页面的URL。crvframe提供了三个基础的页面用于展示和编辑数据。 
        * **listview**  用于列表数据的展示，对于一个数据模型的访问，通常首先是通过菜单打开模型对应的列表数据，用户可以在列表中对数据进行过滤，也可以在列表中勾选数据进行进一步的操作处理。listview页面的URL以/listview/#/开始，后面跟上模型的ID。上面的例子中的url表示在listview中展示模型core_user的数据。
        * **formview** formview用于创建或编辑模型的数据，也可以用于展示模型数据的详情，formview一次仅能显示或编辑模型的单个记录。 formview页面的URL以/formview/#/开始，后面依次跟上模型ID、表单ID、操作类型。 
          ```          
          //下面这个url用于打开一个formview用于创建模型core_user的记录，创建记录时将使用的表单ID为form1，操作类型create表示用于创建记录。 
          /formview/#/core_user/form1/create
          ```
          crvframe支持三种表单操作类型:
          * **create** 用于创建新的模型记录。
          * **edit** 用于编辑一个已经存在的记录。
          * **detail** 用于查看一个记录的详细信息，详情页面中不能对数据做任何修改。
        * **report** 报表页面使用图表形式展示统计数据。报表页面的URL以/report/#/开头，后面跟上报表的ID。
          ```          
          //下面这个URL用于打开ID为dashboard的报表页面。 
          /report/#/dashboard
          ```
      * **location** 指定页面打开的位置。crvframe中目前有两个位置可以打开页面：
        * **tab** 在位于标题栏下方的内容展示区中创建一个新的tab页来打开页面。
        * **modal** 在弹出的模态框中打开页面。 
      * **title** 打开页面的标题栏上的文字。
      * **key** 页面的唯一标识。在操作中可以通过这个标识来引用页面，比如要刷新一个页面的数据。
      * **view** 在crvframe中一个模型允许包含多个视图，当使用listview展示一个模型的数据时，将默认先显示第一个视图的数据，通过这个参数，可以指定默认显示其它视图的数据。这个参数的值对应一个视图的ID。这个参数是可选的，目前仅在打开listview时有效。
      * **filter** 用于指定打开模型的列表页时使用的默认过滤条件。这个参数是可选的，目前仅在打开listview时有效。
    * **input** 当通过crvframe的页面上的按钮调用一个operation时，input的值都是根据用户在页面的选择或录入生成的。在一些特定的场景中，可以通过指定input参数来配置操作的输入数据。
      * 例如在打开一个create类型的formview用于创建模型的数据时，可以通过设置input参数来指定新创建的记录的初始值。
        ```
        {
          "input":{
            "list":[{"gender":"female"}]
          },
        }
        ```
        **note** 这里注意input参数的格式，之所以要采用这样看上去比骄复杂的格式是为了保持程序整体数据格式的一致性。输入的初始值必须放在名称为list的array中，输入参数是一个对象，对象的属性对应模型的字段。上面的示例展示了如何将gender字段的值设置为female。    

  * **close**
    * **description**: 关闭一个已经打开的页面。
    * **parameters**: 
      ```
      {
        "params":{
          "location":"modal",
        },
      }
      ```
      * **location** 目前，crvframe仅允许关闭一个位于最顶层的模态对话框。所以ocation参数必须是modal。
  * **request**
    * **description**: 发起http调用。
    * **parameters**:
      ```
      {
        "params":{
          "url":"/data/save",
          "method":"post"
        },
      }
      ```
      * **url** 调用的目标地址。crvframe提供了以下标准调用用于操作位于数据库中的模型数据。 
        * **/data/query** 查询数据。crvframe中的listview使用这个接口来进行模型数据的过滤查找。
        * **/data/save** 保存模型数据到数据，保存接口集成了新增、删除、更新数据的功能，根据数据中携带的标识进行实际的操作，一次可以操作多个相关联的模型的数据。
        * **/data/delete** 基于给定条件，对符合条件的数据做删除处理。
        * **/data/update** 基于给定条件，对符合条件的数据将指定字段值统一更新为给定的值。
        * **/redirect** 如果要调用第三方的API或定制接口，则可以使用redirect。这个方式避免了前端页面直接调用第三方接口的情况。
      * **method** 调用请求的http method。目前crvframe提供的接口均采用post方式。
    * **input** 在调用接口时，可以通过input参数提供一些固定的数据。以下是目前crvframe提供的接口中使用input的场景： 
        当使用/data/update接口更新数据时，如果希望将选定的记录的字段更改为固定的值，则可以通过设置input参数来实现。 
        下面的例子将所有选定记录的gender字段的值修改为female。
        ```
        {
          "input":{
            "list":[{"gender":"female"}]
          },
        }
        ```
        **note** 这里允许同时修改多个字段的值。
      
      * 当使用redirect接口调用外部的API接口时，需要通过input参数提供外部接口的标识，外部接口通过inut参数中的to属性指定。
        ```
          {
            "input":{
              "to":"external_api_id",
              "other_key":"other_value",
            },
          }
        ```
        **note** 在input参数中也可以设置其它的键值属性，当crvframe发送http请求之前会将用户在页面上的输入数据和这些数据进行合并，这些属性值也将被传递给对应的API，这里需要注意的是如果用户在页面上录入的数据的键名称和input参数中的键名一致时，用户在页面录入的数据会覆盖input中设置的数据。
      
  * **reloadFrameData**
    * **description**: 通知指定的页面重新加载数据。
    * **parameters**:
      ```
        "params":{
          "location":"tab",
          "key":"/model/core_user"
        },
      ```
      * **location**: 要刷新的页面的打开位置，tab、modal。
      * **key**: 要刷新的页面的标识，这个值对应在open操作中指定的key。 

  * **logout**
    * **description**: 登出系统。
    * **parameters**:无参数

  * **message**
    * **description**: 向用户显示提示信息。
    * **parameters**:
      ```
      "params":{
        "type":"success",
        "content":"删除记录成功!",
        "duration":"2"
      }
      ```
      * **type** 提示信息的类型，取值包括：success、error、warning
      * **content** 提示信息的内容。
      * **duration** 提示信息显示几秒后自动消失。
 
### 配置模型的视图
在模型的配置目录下有一个名称为views的子目录，这个目录中一般包含多个JSON文件，每个文件都是针对模型的一个视图，文件名称就是视图的ID。以下是初始应用中core_user模型的一个视图的配置内容：
  ```
  {
    "viewID": "view1", 
    "name": "用户信息维护", 
    "description": "仅包含必要的用户信息", 
    "fields": [
        {"field": "id", "width": 100}, 
        {"field": "user_name_en", "width": 200}, 
        {"field": "user_name_zh", "width": 200}, 
        {"field": "remark", "width": 400}
    ], 
    "filter": { }, 
    "toolbar": {
        "listToolbar": {
            "showCount": 3, 
            "buttons": [
                {
                    "operationID": "create",
                    "name":"创建用户"
                }, 
                {
                    "operationID": "delete",
                    "name":"删除选中用户",
                    "prompt":"确定要删除当前选择的用户记录吗？"
              }
            ]
        }, 
        "rowToolbar": {
            "showCount": 2,
            "width":120, 
            "buttons": [
                {
                    "operationID": "edit",
                    "name":"编辑"
                },
                {
                    "operationID": "detail",
                    "name":"详情"
                }, 
                {
                    "operationID": "delete",
                    "name":"删除",
                    "prompt":"确定要删除这个用户信息吗？"
                }
            ]
        }
    }
  }
  ```

  **各配置项的含义如下:**
  * **viewID** 视图的ID，应该和文件名称一致。
  * **name** 视图的名称，在listview页面打开一个模型时，listview左上角的下拉列表将显示模型中的视图列表，列表项将显示对应视图的名称。
  * **description** 对视图的简要说明。
  * **fields** 视图中包括的模型的字段，在crvframe中一个模型可以配置多个视图，每个视图可以包含模型的全部或部分字段，通过这个方式可以把模型中的字段按照业务相关性进行归类，用户可以通过选择不同的视图来查看不同的字段数据。这个属性是一个数组，每个数组项对应一个字段的定义。字段的定义包含以下属性：
    * **field** 字段ID。
    * **width** 字段在页面显示时的宽度，单位为像素。
    * **filterControlType** listview使用表格展示数据，当用户点击字段标题栏上的操作按钮时将弹出操作菜单，菜单中包含一个过滤条件的录入组件，用户可以通过录入数据对某个列的数据进行过滤。默认情况下listview使用文本录入框来录入过滤条件，如果希望通过其它录入方式，则可以通过filterControlType属性来设置输入组件的类型。crvframe目前支持的输入过滤条件的组件包括：
      * **Text** 文本录入框，这个是默认的过滤条件录入组件。
      * **DatePicker** 日期区间选择组件。
      * **SingleSelect**  单选下拉框。
      * **MultiSelect** 多选下拉框。 
    * **format** 仅对日期字段有效，通过这个参数可以指定日期数据的显示格式。crvframe使用moment库来对日期数据进行格式化处理，格式的具体配置形式可参照[moment](https://momentjs.com/)库的说明。
    * **options** 如果字段类型为枚举类型，且filterControlType设置为了SingleSelect或者MultiSelect，则必须指定options参数，options参数是一个数组，数组中的每个项目对应枚举中的一个值，每个枚举项目的配置参数包括：
      * **value** 枚举值。
      * **label** 在下拉框中显示的文字。
        以下是性别字段的options可能的配置示例：
        ```
        "options":[
          {"value":0,"label":"男"},
          {"value":1,"label":"女"},
        ]
        ```
    * **fields** 如果字段类型是一个关联字段，且filterControlType设置为了SingleSelect或者MultiSelect，则必须指定fields参数，fields参数是一个数组，数组中的每个项目对应了需要从关联表中查询的一个字段，以下是一个从多对一字典表中查询ID和name字段的配置示例：
        ```
        "fields":[
          {"field":"id"},
          {"field":"name"}
        ]
        ``` 
    * **optionLabel** optionLabel参数和fields属性配合使用，通过optionLabel参数指定在页面显示数据时实际显示的字段内容，这个参数可以对应要显示的一个字段的名称，也可以是一个js函数，函数的入参为一个数据行，结果为要显示的内容。
        ```
        //下面这个示例是在页面上直接显示name字段的值。
        {
          "optionLabel":"name",
          "fields":[
            {"field":"id"},
            {"field":"name"}
          ] 
          ...
        }
        ```

        ```
        //下面这个示例是在页面上显示id和name字段中间通过下划线拼接后的值，这里optionLabel配置为一段js代码，crvframe会将这段代码放在一个函数中运行，函数的输入参数record对应一行数据，包含的字段就是fields中指定的字段。代码必须通过return返回要显示的内容。
        {
          "optionLabel":"return record.id+'_'+record.name;",
          "fields":[
            {"field":"id"},
            {"field":"name"}
          ] 
          ...
        }
        ```

    * **aggregateFunction** 如果字段类型是many2many，可以通过aggregateFunction指定一个js函数用于聚合多个数据行的数据。函数的输入参数record是一个数组，对应了关联表中相应的多条记录。aggregateFunction用于在表格的单元格中显示数据，这里不能和optionLabel的配置放在一起，因为optionLabel需要同时用于过滤条件的录入组件。
        ```
        //下面这个示例展示了一个many2many字段，关联到一个包含ID和name的字典表，在页面上显示数据时，将多个记录的name字段用逗号分隔后展示在一个字段中。
        {
          "optionLabel":"name",
          "aggregateFunction":"return record.map(item=>item.name).join(',');",
          "fields":[
              {"field":"id"},
              {"field":"name"}
          ]
        }
        ```
  * **filter** 数据的过滤条件，当用户通过listview查看模型的数据时，可以通过不同的视图来查看不同的数据子集，通过过滤可以方便用户查看不同的状态的数据，减少复杂查询条件的录入。过滤条件是一个对象，具体参数格式可参考以下示例：
      ```
      //以下过滤条件的配置对应的SQL过滤条件为：  where field1=value1 and field2 in (val1,val2) and (field3=val3 or field4=val4) 
      {
        "filter":{
          "field1":"value1",
          "field2":{"Op.in":["val1","val2"]},
          "Op.or":[
            {"field3":"val3"},
            {"field4":"val4"},
          ]
        }
      }
      ```
      在filter中允许使用一些全局系统变量来过滤数据，包括：当前登录用户ID，当前登录用户角色。
      ```
      //以下示例中演示了使用当前登录用户ID(**%{userID}**)和用户的角色(%{userRoles})过滤数据，这里需要注意的是因为一个用户一般是可以有多个对应的角色，所以当使用用户的角色来过滤数据时，应该使用Op.in作为操作符。 
      {
        "filter":{
          "create_user":"",
          "field2":{"Op.in":["val1","val2"]},
          "Op.or":[
            {"create_user":"%{userID}"},
            {"user_role":{"Op.in":[%{userRoles}]}},
          ]
        }
      }
      ```
      
  * **filterData**  举一个实际场景的例子，如果当前模型对应的是文档资料，每个文档上有一个字段标识了这个文档归属的部门，系统仅允许当前登录用户查看所在部门的文档，因此这里需要先根据当前用户ID查找到他所在的部门，然后再用查找的结果中包含的部门去过滤文档资料。filterData参数用于配置需要在filter执行前查询的其它参数。下面是和我们这个场景对应的filterData和filter的配置：
      ```
      {
        "filterData":[
          {
              "modelID":"model_staff",
              "filter":{"login_id":"%{userID}"},
              "fields":[
                  {
                      "field":"departments",
                      "fieldType":"many2many",
                      "relatedModelID":"model_department",
                      "fields":[
                          {"field":"id"}
                      ]
                  }
              ]
          }
        ],
        "filter": {
          "department_id":{
            "Op.in":["%{model_staff.departments.id}"]
            }
          }, 
      }
      ```
      filterData参数是一个数组，因此我们可以配置多个查询，这些查询都可以在filter中被引用。这里在filter中使用了filterData的查询结果，和使用全局变量一样，对filterData的引用需要放在%{}中。
      filterData中的查询可以通过关联字段实现多层级的数据关联查询，目前没有层级数量限制，但层级较多可能会影响查询速度。
      filterData中的filter格式和视图中的filter配置形式一致，允许使用全局参数，但不允许使用其它filterData的结果。
      在视图的filter中引用filterData的结果时，可以根据查询的层级使用点号实现多层级数据的引用。注意这里的多层级引用时，第一个层级的名称取的是modelID，后续层级的名称按照引用的字段名称来引用。比如上面的样例中filter中引用了filterData中的model_staff.departments.id的值，其中model_staff是第一层的modelID，departments、id分别是第二、第三层级中的字段ID。
      因为查询结果通常是一个列表，所以这里的过滤条件一般采用Op.in的形式。对于多层级的字段值，crvframe会将所有数据展开成一个数组放入Op.in对应的值数据中。

  * **sorter** 这个参数用于指定查询数据时默认的数据排序，sorter参数是一个数组，允许指定多个字段进行排序，数组中的一个项目对应一个字段，crvframe会按照字段在数据中的先后顺序作为优先级来对数据进行排序处理。以下是一个配置样例：
      ```
      //这个例子指定按照update_time字段对数据进行降序排列
      {
        "sorter":[
          {"field":"update_time","order":"desc"}
        ]
      }
      ```

  * **toolbar** 这个参数用于配置视图上的按钮，通过这些按钮用户可以调用后端服务对数据执行操作，或者打开编辑表单页面让用户对数据进行编辑操作。toolbar参数是一个对象，包含两属性，分别对应了视图右上角的操作栏和数据行上的操作栏。两个属性的说明如下：
    * **listToolbar** 位于listview页面右上角的工具栏，用于配置工具栏上的按钮，具体配置格式示例如下：
        ```
        "listToolbar": {
            "showCount": 3, 
            "buttons": [
              {
                "operationID": "create",
                "name":"新增"
              },
              {
                "operationID": "submmit",
                "name":"提交",
                
              }
            ]
        }
        ```
        具体参数说明：
      * **buttons** 工具上的按钮，这个参数是一个数组，数组中的每个项目对应一个按钮的配置，按钮的配置参数如下：
        * **operationID** 按钮对应的操作的ID，这个参数是可选参数，如果不指定operationID，则需要直接配置一个operation，配置方式和operation配置一致，可以不指定ID。直接配置operation的方式不能对operation的权限进行控制。
        * **name** 按钮在页面上显示的名字，这个参数是可选参数，如果不指定这个参数，则名字会取operation对应的名字。
        * **prompt** 当用户点击按钮时，可以提示用户是否确认对应的操作，通过prompt可以配置一个提示信息。这个参数是可选参数，如果不指定这个参数则不会弹出提示。
        * **selectedRows** 在执行按钮对应的操作时如果要求用户必须选择对应的数据行，则可以通过selectedRows来进行指定，selectedRows是一个对象，包含的属性如下：
          * **min** 最少需要选择的数据行，如果点击按钮时用户选择的数据行数量小于这个值则会弹出prompt提示信息。
          * **max** 最多可以选择的数据行，如果点击按钮时用户选择的数据行数量大于这个值也会弹出prompt提示信息。
          * **prompt** 点击按钮时用户选择的数据行数量小于min或大于max参数时需要向用户展示的提示信息。
      * **showCount** 这个参数用于指定在工具栏上实际显示的按钮的最大个数，如果buttons中配置的按钮超过了这个数量，则仅显示前面的序号小于参数的按钮，其它按钮将隐藏在工具栏最右侧的弹出菜单中。                    
    * **rowToolbar** 数据行上的按钮，这个参数也是一个数组，数组中的每个项目对应一个按钮的配置，按钮的配置和listToolbar基本一致，这里仅给出不同的地方：
      * **width** 数据行上的按钮将显示在listview表格左侧的操作列上，这个属性用于指定操作列的宽度，单位为像素。
      * **selectedRows** 对于数据行上的操作按钮，crvframe将默认选中当前点击按钮所在的行，这里不支持用selectedRows进行选择行的校验。

### 配置模型的表单
在模型的配置目录下有一个名称为forms的子目录，这个目录中一般包含多个JSON文件，每个文件都对应一个表单配置，文件名称就是表单的ID。以下是初始应用中core_user模型的一个表单的配置内容：

  ```
  {
    "formID": "form1",
    "colCount": 4,
    "rowHeight": 30,
    "header":{
        "label":"创建用户"
    },
    "footer":{
        "buttons":[
            {
                "operationID":"save",
                "name":"保存"
            },
            {
                "name":"关闭",
                "type":"close",
                "validateFormData":false,
                "params":{
                    "location":"modal"
                },
                "input":{},
                "description":"关闭对话框"                            
            }
        ]
    },
    "controls": [
        {
            "controlType": "Text",
            "row": 1,
            "col": 1,
            "field": "id", 
            "label": "ID",
            "colSpan": 2,
            "rowSpan": 1,
            "required":true
        }, 
        {
            "controlType": "Text",
            "row": 2,
            "col": 1,
            "field": "user_name_en", 
            "colSpan": 2,
            "rowSpan": 1
        }, 
        {
            "controlType": "Text",
            "row": 3,
            "col": 1,
            "field": "user_name_zh", 
            "colSpan": 2,
            "rowSpan": 1
        }, 
        {
            "controlType": "Password",
            "row": 4,
            "col": 1,
            "field": "password", 
            "colSpan": 2,
            "rowSpan": 1,
            "required":true
        },
        {
            "controlType": "Text",
            "row": 5,
            "col": 1,
            "field": "remark", 
            "colSpan": 2,
            "rowSpan": 2
        },
        {
            "field": "user_role",
            "controlType": "Transfer",
            "required":true,
            "row": 1,
            "col": 3,
            "colSpan": 2,
            "rowSpan": 6,
            "fields":[
                {
                    "field": "id"
                }
            ]
        }
    ]
  }
  ```
  
  **各配置项的含义如下:**
  * **formID** 表单的ID，应该和文件名称一致。
  * **colCount** 目前crvframe的表单仅支持grid布局，这个参数用于指定grid的列数。
  * **rowHeight**: 这个参数用于设置grid布局中的行高。
  * **header** 这个参与用于配置表单的标题栏，header参数是一个对象，包括以下属性：
    * **label** 标题栏上默认显示的文字，这个参数是可选的，一般标题栏上的文字可以通过open操作设置，如果open操作中没有指定打开表单的title，则crvframe会使用label作为标题栏文字。
    * **buttons** buttons用于定义放在标题栏右侧的操作按钮，buttons是一个数组，每个数组项是一个按钮的配置，每个按钮包括以下属性：
      * **operationID** 按钮对应的操作的ID，这个参数是可选参数，如果不指定operationID，则需要直接配置一个operation，配置方式和operation配置一致，可以不指定ID。直接配置operation的方式不能对operation的权限进行控制。
      * **name** 按钮在页面上显示的名字，这个参数是可选参数，如果不指定这个参数，则名字会取operation对应的名字。
      * **validateFormData** 当用户在一个表单上点击按钮时crvframe默认会对表单的数据进行合法性校验，如果校验出错则会阻止按钮对应操作的执行。 当validateFormData的值设置为false时，将不执行数据合法性校验，直接执行按钮对应的操作。
  * **footer** 表单下方的脚注栏，footer参数是一个对象，除了label属性外，footer对象包括的属性和header一样。
  * **controls** 表单内容部分的组件配置，controls是一个数组，数组的每个项对应一个组件，一个组件通常对应一个模型的字段。组件包括以下通用属性：
    * **field** 组件对应的模型字段。
    * **controlType** 组件的类型。不同的组件一般需要额外配置一些附加属性，crvframe目前支持的组件及其附加属性将在下一个章节中说明。
    * **row** 组件起始位置位于表单grid布局中的行号，整数类型，从1开始自增。
    * **col** 组件起始位置位于表单grid布局中的列号，证书类型，从1开始递增，一般应该不大于表单的colCount。
    * **rowSpan** 组件高度占用的行数。
    * **colSpan** 组件宽度占用的列数。
    * **label** 组件的标题，这个参数是可选的，如果不设置则取对应field的name属性。
    * **disabled** 组件是否可编辑，true/false。
    * **required** 编辑或创建数据时，组件的值是否必须填写，true/false。
    * **validation** 用于配置字段值有效性的校验逻辑，validation是一个对象，包含以下属性：
      * **func** js函数脚本，参数record表示表单的数据，函数应返回一个bool值，true表示校验通过，false表示校验失败。
      * **message** 当校验失败时提示用户的信息。
      以下是一个校验逻辑配置的样例：
      ```
        "validation":{
          "func":"return record.end_date>record.start_date;",
          "message":"结束时间应该大于开始时间"
        }
      ``` 
#### 表单中支持的组件
##### Text 文本录入框
  * **controlType**：Text
  * **说明**：用于文本数据的显示和编辑。
  * **附加参数**
    * **placeholder** 文本编辑框的提示信息。

##### TextArea 多行文本编辑框
  * **controlType**：TextArea
  * **说明**：用于长文本数据的显示和编辑。
  * **附加参数**
    * **placeholder** 文本编辑框的提示信息。
    * **textRowCount** 组件可直接显示的文本行数，超过这个行数需要通过滚动条拖动显示，这个行数将改变组件在页面显示的高度，可能对布局产生影响。

##### DatePicker 日期选择框
  * **controlType**：DatePicker
  * **说明**：用于日期选择和输入。
  * **附加参数**
    * **showTime** 是否包含时间，组件默认仅显示日期，如果需要同时显示时间，则需要将showTime设置为true。

##### TimePicker 时间选择
  * **controlType**：TimePicker
  * **说明**：用于时间选择和输入。
  * **附加参数**
    无

##### Password 密码输入控件
  * **controlType**：Password
  * **说明**：用于密码的输入。
  * **附加参数**
    无

##### Transfer 穿梭框控件
  * **controlType**：Transfer
  * **说明**：穿梭框一般用于从备选数据中选取多个，通常对应many2many字段的录入。
  * **附加参数**
    * **maxHeight** 控件在页面显示的最大高度。
    * **fields** 穿梭框组件的field属性对应的模型字段通常是一个many2many字段，穿梭框中的备选数据需要从many2many字段对应的关联表中查询获取，fields用于指定查询关联表中的哪些字段，fields是一个数组，数组中的每个项目对应关联表中的一个字段，这里注意字段中必须包含id字段，每个字段的属性如下：
      * **field** 需要查询的字段名称。
    * **optionLabel** 这个参数和fields参数配合使用，用于指定在选择列表中显示的字段，如果不指定这个参数，crvframe会默认显示id字段的值。  
    * **cascade** 在有些应用场景中，一个字段的数据的备选项需要依赖于其它字段已经选择的值，cascade参数用于配置当前字段的备选项依赖于其它哪些字段的取值，cascade可以是一个对象，也可以是一个数组，如果当前字段依赖的字段仅有一个则可以使用对象进行配置，如果依赖于多个字段的值，则需要使用数组形式对多个依赖字段进行配置。cascade包含的属性如下：
      * **parentField** 指定当前字段依赖的模型中的另一个字段id。
      * **type** 这里指定parentField的字段类型，目前仅支持many2one关联字段类型。

##### SingleSelect 单选下拉框
  * **controlType**：SingleSelect
  * **说明**：单选下拉框组件一般用于枚举选项的选择，也可以用于many2one字段的下拉选择。
  * **附加参数**
    * **fields** 如果单选下拉组件对应的模型字段是一个many2one字段，下拉框中的备选项需要从关联表中查询获取，fields用于指定查询关联表中的哪些字段，fields是一个数组，数组中的每个项目对应关联表中的一个字段，这里注意字段中必须包含id字段，每个字段的属性如下：
      * **field** 需要查询的字段名称。  
    * **optionLabel** 这个参数和fields参数配合使用，用于指定在选择列表中显示的字段，如果不指定这个参数，crvframe会默认显示id字段的值。


##### File 文件选择
  * **controlType**：File
  * **说明**：文件选择组件用于在表单中选择文件，一般用于数据导入或附件上传，文件选择组件对应的模型字段的fieldType应该是file类型。
  * **附加参数**
    * **maxCount** 允许选择的文件最大数量。
    * **selectButtonLabel** 组件按钮上显示的文字，如果不指定，crvframe默认显示为**选择文件**

##### EditTable 表格编辑控件
##### FunctionTextArea 函数计算文本控件
##### ImageList 图片文件列表
##### Number 数值录入
##### RichText 富文本   










  

      


   








