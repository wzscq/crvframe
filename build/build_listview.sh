#!/bin/sh
echo create folder for build package ...
if [ ! -e package ]; then
  mkdir package
fi

if [ ! -e package/web ]; then
  mkdir package/web
fi

echo build the code ...
cd ../listview
npm install
npm run build
cd ../build

echo remove last package if exist
if [ -e package/web/listview ]; then
  rm -rf package/web/listview
fi

rm -rf ../listview/build/asset-manifest.json
rm -rf ../listview/build/manifest.json
rm -rf ../listview/build/robots.txt
rm -rf ../listview/build/favicon.ico
rm -rf ../listview/build/logo192.png
rm -rf ../listview/build/logo512.png

mv ../listview/build ./package/web/listview

echo listview package build over.
