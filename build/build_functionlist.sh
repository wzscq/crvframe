#!/bin/sh
echo create folder for build package ...
if [ ! -e package ]; then
  mkdir package
fi

if [ ! -e package/web ]; then
  mkdir package/web
fi

echo build the code ...
cd ../functionlist
npm install
npm run build
cd ../build

echo remove last package if exist
if [ -e package/web/functionlist ]; then
  rm -rf package/web/functionlist
fi

mv ../functionlist/build ./package/web/functionlist

echo functionlist package build over.
