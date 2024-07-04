#!/bin/sh
echo create folder for build package ...
if [ ! -e package ]; then
  mkdir package
fi

if [ ! -e package/web ]; then
  mkdir package/web
fi

echo build the code ...
cd ../report
npm install
npm run build
cd ../build

echo remove last package if exist
if [ -e package/web/report ]; then
  rm -rf package/web/report
fi

rm -rf ../report/build/asset-manifest.json
rm -rf ../report/build/manifest.json
rm -rf ../report/build/robots.txt
rm -rf ../report/build/favicon.ico
rm -rf ../report/build/logo192.png
rm -rf ../report/build/logo512.png

mv ../report/build ./package/web/report

echo report package build over.
