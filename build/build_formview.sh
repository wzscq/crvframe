#!/bin/sh
echo create folder for build package ...
if [ ! -e package ]; then
  mkdir package
fi

if [ ! -e package/web ]; then
  mkdir package/web
fi

echo build the code ...
cd ../formview
npm install
npm run build
cd ../build

echo remove last package if exist
if [ -e package/web/formview ]; then
  rm -rf package/web/formview
fi

mv ../formview/build ./package/web/formview
echo formview package build over.
