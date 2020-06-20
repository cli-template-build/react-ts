const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const chalk = require('react-dev-utils/chalk');
const resolve = require('resolve');

const getAdditionalModulePaths = (options = {}) => {
  const baseUrl = options.baseUrl;
  if (baseUrl == null) {
    const nodePath = process.env.NODE_PATH || '';
    return nodePath.split(path.delimiter).filter(Boolean);
  }
  const baseUrlResolved = path.resolve(paths.appPath, baseUrl);

  // 这个就说明baseUrl 就是 node_modules 的地址
  if (path.relative(paths.appNodeModules, baseUrlResolved) === '') return null;

  // 这个说明 baseUrl 就是 app 的地址
  if (path.relative(paths.appSrc, baseUrlResolved) === '')
    return [paths.appSrc];
};


