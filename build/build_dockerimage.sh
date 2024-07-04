cp ./404.html ./package/web/404.html
docker image rm wangzhsh/crvframe:0.1.1
docker build . -t wangzhsh/crvframe:0.1.1
docker push wangzhsh/crvframe:0.1.1