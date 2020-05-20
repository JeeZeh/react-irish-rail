// production config
const merge = require("webpack-merge");
const CompressionPlugin = require("compression-webpack-plugin");
const { resolve } = require("path");

const commonConfig = require("./common");

module.exports = merge(commonConfig, {
  mode: "production",
  entry: "./index.tsx",
  output: {
    filename: "js/bundle.[hash].min.js",
    path: resolve(__dirname, "../../dist"),
    publicPath: "/",
  },
  plugins: [new CompressionPlugin()],
});
