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
node ./copy_tinymce.js
cd ../build

echo remove last package if exist
if [ -e package/web/formview ]; then
  rm -rf package/web/formview
fi

rm -rf ../formview/build/tinymce
rm -rf ../formview/build/asset-manifest.json
rm -rf ../formview/build/manifest.json

mv ../formview/build ./package/web/formview

echo formview package build over.
