const fs = require('fs');
const path = require('path');
const paths = require('./paths');

delete require.cache[require.resolve('./paths')];

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  throw new Error('The NODE_ENV environment variable is required but was not specified.');
}

const dotEnvFiles = [
  `${paths.dotEnv}.${NODE_ENV}.local`,
  `${paths.dotEnv}.${NODE_ENV}`,
  NODE_ENV !== 'test' && `${paths.dotEnv}.local`,
  paths.dotEnv,
].filter(Boolean);

// 从.env*文件加载环境变量。使用silent禁用警告
// 如果该文件丢失。dotenv不会修改任何环境变量
// .env文件支持变量扩展。
// https://github.com/motdotla/dotenv
// https://github.com/motdotla/dotenv-expand
dotEnvFiles.forEach(dotEnvFile => {
  if (fs.existsSync(dotEnvFile)) {
    require('dotenv-expand')(
      require('dotenv').config({ path: dotEnvFile }),
    );
  }
});

// 我们支持根据'NODE_PATH'解析模块。
// 这让你在大型 monorepos 中使用绝对路径导入:
// https://github.com/facebook/create-react-app/issues/253。
// 它的工作方式类似于Node本身的 'NODE_PATH':
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
// 注意，与Node不同的是，只有来自 'NODE_PATH' 的*相对*路径被尊重。
// 否则，我们将冒着将Node.js核心模块导入应用而不是webpack垫片的风险。
// https://github.com/facebook/create-react-app/issues/1023#issuecomment-265344421
// 我们还解决了这些问题，以确保使用这些工具的所有工具都能一致地工作。
const appDirectory = fs.realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH || '')
  .split(path.delimiter)
  .filter(folder => folder && !path.isAbsolute(folder))
  .map(folder => path.resolve(appDirectory, folder))
  .join(path.delimiter);

const REACT_APP = /^REACT_APP_/i;

const getClientEnvironment = publicUrl => {
  const raw = Object.keys(process.env)
    .filter(key => REACT_APP.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        // 用于确定我们是否在生产模式下运行。
        // 最重要的是，它切换到正确的反应模式。
        NODE_ENV: process.env.NODE_ENV || 'development',
        // 对于解析“public”中静态资产的正确路径非常有用。
        // 例如 <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // 这个只能用作逃生口。通常你会把 image 导入到 'src' 中，并在代码中 'import' 它们以获得它们的路径。
        PUBLIC_URL: publicUrl,
        // 我们支持在开发过程中配置sockjs路径名。
        // 这些设置让开发人员可以同时运行多个项目。
        // 它们用作连接的“hostname”、“pathname”和“port”
        // 在webpackHotDevClient。它们被用作webpack-dev-server中的“sockHost”、“sockPath”和“sockPort”选项。
        WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
        WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
        WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
      },
    );
  // Stringify all values so we can feed into webpack DefinePlugin
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };

  return { raw, stringified };
};

module.exports = getClientEnvironment;
