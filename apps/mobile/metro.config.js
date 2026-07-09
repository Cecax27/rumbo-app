//const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Ensure font and other asset extensions are always registered
const { assetExts, sourceExts } = config.resolver;
config.resolver.assetExts = [...new Set([...assetExts, 'ttf', 'otf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'])];
config.resolver.sourceExts = [...new Set([...sourceExts])];

// This monorepo uses pnpm with `node-linker=hoisted`, so the root node_modules
// holds React 19.2.x (pulled in by the web app) while Expo SDK 53 pins React
// 19.0.0 for the mobile app. Packages that don't get their own nested copy of
// React (e.g. nativewind, which is also used as the JSX runtime via
// `jsxImportSource: 'nativewind'`) end up requiring the root React 19.2.x.
// Mixing that with the app's React 19.0.0 triggers "Invalid hook call".
// Force every module to resolve React/React-DOM (and subpaths) to this app's
// own copies so a single React instance is bundled. (react-native has a single
// hoisted copy, so it's intentionally left out.)
//const dedupeModules = {
//  react: path.resolve(__dirname, 'node_modules/react'),
//  'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
//};

//config.resolver.resolveRequest = (context, moduleName, platform) => {
//  const parts = moduleName.split('/');
//  const pkgName = moduleName.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
//  const target = dedupeModules[pkgName];
//  if (target) {
//    return context.resolveRequest(context, target + moduleName.slice(pkgName.length), platform);
//  }
//  return context.resolveRequest(context, moduleName, platform);
//};

module.exports = withNativeWind(config, { input: './global.css' });
