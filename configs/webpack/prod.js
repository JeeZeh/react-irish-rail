// production config
const { merge } = require("webpack-merge");
const CompressionPlugin = require("compression-webpack-plugin");
const { resolve } = require("path");
const commonConfig = require("./common");
const WorkboxPlugin = require("workbox-webpack-plugin");

module.exports = merge(commonConfig, {
  mode: "production",
  entry: "./index.tsx",
  output: {
    filename: "js/bundle.[hash].min.js",
    path: resolve(__dirname, "../../dist"),
    publicPath: "/",
  },
  plugins: [
    new CompressionPlugin(),
    new WorkboxPlugin.GenerateSW({
      // these options encourage the ServiceWorkers to get in there fast
      // and not allow any straggling "old" SWs to hang around
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 1e7,
    }),
  ],
});
