cp ./404.html ./package/web/404.html
docker image rm registry.cn-hangzhou.aliyuncs.com/wangzhsh/crvframe:0.1.1
docker build . -t registry.cn-hangzhou.aliyuncs.com/wangzhsh/crvframe:0.1.1
docker push registry.cn-hangzhou.aliyuncs.com/wangzhsh/crvframe:0.1.1