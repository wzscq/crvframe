# crv_frame_build

#run crvframe in docker
docker run -d --name crvframe -p8010:80 -v /root/crvframe/logs:/services/crvframe/logs -v /root/crvframe/appfile:/services/crvframe/appfile -v /root/crvframe/apps:/services/crvframe/apps -v /root/crvframe/conf:/services/crvframe/conf --log-driver json-file --log-opt max-size=10m  registry.cn-hangzhou.aliyuncs.com/wangzhsh/crvframe:0.1.1

install docker
centos：
yum install -y yum-utils
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl start docker
systemctl enable /usr/lib/systemd/system/docker.service

ubuntu 22.04 :
Set up Docker's apt repository.
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

Install the Docker packages.
apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

install mongo
mkdir /root/mongo
mkdir /root/mongo/data
mkdir /root/mongo/dump
mkdir /root/mongo/conf
docker run --name mongo -v /root/mongo/data:/data/db -v /root/mongo/dump:/dump -v /root/mongo/conf:/etc/mongo -p 37017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=AAA@111 -d mongo:5.0

install mysql
mkdir /root/mysql
mkdir /root/mysql/conf
mkdir /root/mysql/data
mkdir /root/mysql/log

镜像s：1qaz@WSX

上传mysql配置文件mysql.cnf到服务器目录/root/mysql/conf下
docker run --name mysql -e MYSQL_ROOT_PASSWORD=1qaz@WSX -v /root/mysql/data:/var/lib/mysql -v /root/mysql/log:/var/log/mysql -p 4306:3306 -v /root/mysql/conf:/etc/mysql/conf.d -d  mysql:8.0.18

install redis
mkdir /root/redis
mkdir /root/redis/data
mkdir /root/redis/conf
touch /root/redis/conf/redis.conf

docker run --name redis -p 6479:6379 -v /root/redis/data:/data -v /root/redis/conf/redis.conf:/etc/redis/redis.conf --privileged=true --restart=always -d redis redis-server /etc/redis/redis.conf

docker run --name redis -p 6379:6379 -v /home/release/redis/data:/data -v /home/release/redis/conf/redis.conf:/etc/redis/redis.conf --privileged=true --restart=always -d redis redis-server /etc/redis/redis.conf

install mosquitto
mkdir /root/mosquitto
mkdir /root/mosquitto/config
mkdir /root/mosquitto/data
mkdir /root/mosquitto/log
上传mosquitto.conf和password_file到/root/mosquitto/config目录下

docker run -it --name mosquitto -p 1983:1883 -p 9101:9001 -v /root/mosquitto/config:/mosquitto/config -v /root/mosquitto/data:/mosquitto/data -v /root/mosquitto/log:/mosquitto/log -d eclipse-mosquitto

install node
wget https://nodejs.org/dist/v21.7.3/node-v21.7.3-linux-x64.tar.gz
tar -xvf node-v21.7.3-linux-x64.tar.gz
mv node-v21.7.3-linux-x64 node

vi /etc/profile  增加以下内容
export NODE_HOME=/root/node
export PATH=$NODE_HOME/bin:$PATH
让配置生效
source /etc/profile

install go
wget https://golang.google.cn/dl/go1.21.3.linux-amd64.tar.gz
tar -xzf go1.21.3.linux-amd64.tar.gz

vi /etc/profile  增加以下内容
export PATH=$PATH:/root/go/bin
export GO111MODULE=on
export GOPROXY=https://goproxy.io
让配置生效
source /etc/profile

//go get 加速
# 配置 GOPROXY 环境变量，以下三选一
# 1. 七牛 CDN
GOPROXY=https://goproxy.cn,direct
# 2. 阿里云
GOPROXY=https://mirrors.aliyun.com/goproxy/,direct
# 3. 官方
GOPROXY=https://goproxy.io,direct

# 导出镜像包命令
docker save -o crvframe.tar wangzhsh/crvframe:0.1.0
#导入镜像包命令
docker load -i crvframe.tar

# 清理镜像vfs，注意会删除所有为使用的容器和镜像
docker system prune -a --volumes

# 相关资源
https://quilljs.com/docs/api/
https://github.com/microsoft/monaco-editor

# docker镜像加速
创建或修改/etc/docker/daemon.json文件
默认没有daemon文件，先创建。
vim /etc/docker/daemon.json
内容如下：
{
  "registry-mirrors":[
      "https://ung2thfc.mirror.aliyuncs.com",
      "https://registry.docker-cn.com",
      "https://hub-mirror.c.163.com"
   ]
}

# 查看docker文件目录
docker info | grep -i 'docker root dir'

# 清理容器日志
cat /dev/null > /var/lib/docker/containers/容器id/容器id-json.log

https://centos.pkgs.org/

//mysql备份
mysqldump -u [username] -p[password] [database] > backup.sql

//前端编译报错需要执行这个
export NODE_OPTIONS=--openssl-legacy-provider


docker run -d registry.cn-hangzhou.aliyuncs.com/wangzhsh/rttkservice_arm64:0.0.1 /bin/sh -c "while true;do echo hello docker;sleep 1;done"

//nginx
docker run --name nginx -p 80:80 -p 443:443 -v /root/nginx/conf/mime.types:/etc/nginx/mime.types -v /root/nginx/conf/nginx.conf:/etc/nginx/nginx.conf -v /root/nginx/conf/forward.conf:/etc/nginx/forward.conf -v /root/nginx/conf/buoyancyinfo.conf:/etc/nginx/buoyancyinfo.conf -v /root/nginx/conf/youlian.conf:/etc/nginx/youlian.conf -v /root/nginx/conf/server.pem:/etc/nginx/server.pem -v /root/nginx/conf/server.key:/etc/nginx/server.key -v /root/release/web:/usr/share/nginx/web -v /root/nginx/log:/var/log/nginx --privileged=true --restart=always -d nginx:1.17.9