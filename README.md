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
Before run the dokcer instance，create the directories for configuration files.

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
  * **dbName**:The default MYSQL database for connection.
  
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
  





 
