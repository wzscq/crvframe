# crv_frame_build

#run crvframe in docker
docker run -d --name crvframe -p80:80 -v /root/crvframe/appfile:/services/crvframe/appfile -v /root/crvframe/apps:/services/crvframe/apps -v /root/crvframe/conf:/services/crvframe/conf wangzhsh/crvframe:0.1.0 


相关资源
https://quilljs.com/docs/api/
https://github.com/microsoft/monaco-editor
