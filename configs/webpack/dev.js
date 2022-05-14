const { merge } = require("webpack-merge");
const webpack = require("webpack");
const commonConfig = require("./common");

module.exports = merge(commonConfig, {
  mode: "development",
  entry: [
    "webpack-dev-server/client?http://localhost:3333", // bundle the client for webpack-dev-server and connect to the provided endpoint
    "webpack/hot/only-dev-server", // bundle the client for hot reloading, only- means to only hot reload for successful updates
    "./index.tsx", // the entry point of our app
  ],
  devServer: {
    open: true,
    port: 3333,
  },

  devtool: "eval-cheap-module-source-map",
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // enable HMR globally
  ],
});
