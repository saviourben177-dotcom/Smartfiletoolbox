const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// pdf-lib depends on tslib, whose package "exports" map resolves to an ESM
// build that breaks CommonJS-style destructuring (`const { __extends } =
// require('tslib')`) under Metro's package-exports resolution. Falling back
// to the classic main-field resolution for tslib avoids the mismatch.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return context.resolveRequest(
      { ...context, unstable_enablePackageExports: false },
      moduleName,
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
