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

mv ../report/build ./package/web/report

echo report package build over.
