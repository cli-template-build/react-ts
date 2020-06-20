const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const chalk = require('react-dev-utils/chalk');
const paths = require('./paths');

const validateKeyAndCerts = params => {
  const { cert, key, keyFile, crtFile } = params;
  let encrypted;
  try {
    /*
      crypto.publicEncrypt(key, buffer)
      加密， 返回一个加密的结果
    * */
    // 加密
    encrypted = crypto.publicEncrypt(cert, Buffer.from('test'));
  } catch (err) {
    throw new Error(
      `The certificate "${chalk.yellow(crtFile)}" is invalid.\n${err.message}`,
    );
  }
  try {
    // 解密
    crypto.privateDecrypt(key, encrypted);
  } catch (err) {
    throw new Error(
      `The certificate key "${chalk.yellow(keyFile)}" is invalid.\n${
        err.message
      }`,
    );
  }
};

const readEnvFile = (file, type) => {
  if (!fs.existsSync(file)) {
    throw new Error(
      `You specified ${chalk.cyan(
        type,
      )} in your env, but the file "${chalk.yellow(file)}" can't be found.`,
    );
  }
  return fs.realpathSync(file);
};

const getHttpsConfig = () => {
  const { SSL_CRT_FILE, SSL_KEY_FILE, HTTPS } = process.env;
  const isHttps = HTTPS === 'true';
  if (isHttps && SSL_CRT_FILE && SSL_KEY_FILE) {
    const crtFile = path.resolve(paths.appPath, SSL_CRT_FILE);
    const keyFile = path.resolve(paths.appPath, SSL_KEY_FILE);
    const config = {
      cert: readEnvFile(crtFile, 'SSL_CRT_FILE'),
      key: readEnvFile(keyFile, 'SSL_KEY_FILE'),
    };
    // 其实主要目的就是验证加解密是否成功
    validateKeyAndCerts({ ...config, keyFile, crtFile });
    return config;
  }
  return isHttps;
};
