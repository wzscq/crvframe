#!/bin/sh
echo remove old temp files ...
if [ -a main_frame ]; then
  rm -rf main_frame
fi

echo create folder for build package ...
if [ ! -e package ]; then
  mkdir package
fi

if [ ! -e package/web ]; then
  mkdir package/web
fi

echo get code from github
git clone https://github.com/wzscq/main_frame.git

echo build the code ...
cd main_frame
npm install
sed -i  's/host=\"*.*\"/host=\"\"/' ./public/index.html
npm run build
cd ..

echo remove last package if exist
if [ -e package/web/main_frame ]; then
  rm -rf package/web/main_frame
fi

mv ./main_frame/build ./package/web/main_frame

rm -rf main_frame
echo main_frame package build over.
