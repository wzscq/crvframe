FROM alpine:3.20
RUN set -eux && sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories && apk add nginx
COPY nginx.conf /etc/nginx/nginx.conf
ADD ./package/web /web
ADD ./package/service/frame /services/crvframe/frame
copy entrypoint.sh /entrypoint.sh
ENTRYPOINT ["sh","entrypoint.sh"]