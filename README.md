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
        "flowInstanceDB":2,
        "appCacheDB":1,
        "flowInstanceExpired":"0s"
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
**redis**
  **server**:redis server address with format of IP:PORT.




create and put the conf.json file to the directory /root/crvframe/conf.

# Run
We recomend run crvframe with docker.
run docker instance using:

``` 
docker run -d --name crvframe -p80:80 -v /root/crvframe/appfile:/services/crvframe/appfile -v /root/crvframe/apps:/services/crvframe/apps -v /root/crvframe/conf:/services/crvframe/conf wangzhsh/crvframe:0.1.0
```




 
