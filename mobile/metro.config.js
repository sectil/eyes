const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolve react-dom to react-native for React Query
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-dom') {
    return context.resolveRequest(context, 'react-native', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
