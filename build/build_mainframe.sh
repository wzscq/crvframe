#!/bin/sh
echo create folder for build package ...
if [ ! -e package ]; then
  mkdir package
fi

if [ ! -e package/web ]; then
  mkdir package/web
fi

echo build the code ...
cd ../mainframe
npm install
sed -i  's/host=\"[^\"]*\"/host=\"\"/' ./public/index.html
npm run build
cd ../build

echo remove last package if exist
if [ -e package/web/mainframe ]; then
  rm -rf package/web/mainframe
fi

rm -rf ../mainframe/build/asset-manifest.json
rm -rf ../mainframe/build/manifest.json
rm -rf ../mainframe/build/robots.txt
rm -rf ../mainframe/build/favicon.ico
rm -rf ../mainframe/build/logo192.png
rm -rf ../mainframe/build/logo512.png

mv ../mainframe/build ./package/web/mainframe

echo mainframe package build over.
