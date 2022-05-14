const { merge } = require("webpack-merge");
const commonConfig = require("./common");

module.exports = merge(commonConfig, {
  mode: "development",
  entry: [
    "./index.tsx", // the entry point of our app
  ],
  devServer: {
    open: true,
    port: 3333,
  },
  devtool: "eval-cheap-module-source-map",
});
