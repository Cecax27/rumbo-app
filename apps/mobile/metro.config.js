const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Ensure font and other asset extensions are always registered
const { assetExts, sourceExts } = config.resolver;
config.resolver.assetExts = [...new Set([...assetExts, 'ttf', 'otf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'])];
config.resolver.sourceExts = [...new Set([...sourceExts])];

module.exports = withNativeWind(config, { input: './global.css' });
