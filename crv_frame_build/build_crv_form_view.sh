#!/bin/sh
echo remove old temp files ...
if [ -a crv_form_view ]; then
  rm -rf crv_form_view
fi

echo create folder for build package ...
if [ ! -e package ]; then
  mkdir package
fi

if [ ! -e package/web ]; then
  mkdir package/web
fi

echo get code from github
git clone https://github.com/wzscq/crv_form_view.git

echo build the code ...
cd crv_form_view
npm install
npm run build
cd ..

echo remove last package if exist
if [ -e package/web/crv_form_view ]; then
  rm -rf package/web/crv_form_view
fi

mv ./crv_form_view/build ./package/web/crv_form_view

rm -rf crv_form_view
echo crv_form_view package build over.
