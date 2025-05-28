const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const nodeLibs = require('node-libs-react-native');

config.resolver.extraNodeModules = {
    ...nodeLibs,
  crypto: require.resolve('./polyfills/empty.js'),
  stream: require.resolve('./polyfills/empty.js'),
  http: require.resolve('./polyfills/empty.js'),
  https: require.resolve('./polyfills/empty.js'),
  url: require.resolve('./polyfills/empty.js'),
  fs: require.resolve('./polyfills/empty.js'),
  net: require.resolve('./polyfills/empty.js'),
  tls: require.resolve('./polyfills/empty.js'),
  os: require.resolve('./polyfills/empty.js'),
  path: require.resolve('./polyfills/empty.js'),
  events: require.resolve('./polyfills/empty.js'),
  util: require.resolve('./polyfills/empty.js'),
};

module.exports = config;
