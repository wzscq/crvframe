# crv_frame_build

#run crvframe in docker
docker run -d -p80:80 -v /root/crvframe/appfile:/frame_service/appfile -v /root/crvframe/apps:/frame_service/apps -v /root/crvframe/conf:/frame_service/conf wangzhsh/crvframe:0.1.0 
