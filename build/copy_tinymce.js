const fse = require('fs-extra');
const path = require('path');
const topDir = __dirname;
fse.emptyDirSync(path.join(topDir, 'package','web','tinymce'));
fse.copySync(path.join(topDir,'..','formview','node_modules', 'tinymce'), path.join(topDir, 'package','web', 'tinymce'), { overwrite: true });