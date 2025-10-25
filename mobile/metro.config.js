const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Root workspace directory
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the workspace
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages from (workspace node_modules)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Resolve react-dom from workspace
config.resolver.extraNodeModules = {
  'react-dom': path.resolve(workspaceRoot, 'node_modules/react-dom'),
};

module.exports = config;
