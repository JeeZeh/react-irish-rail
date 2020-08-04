// shared config (dev and prod)
const { resolve } = require("path");
const { CheckerPlugin } = require("awesome-typescript-loader");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const WorkboxPlugin = require("workbox-webpack-plugin");

module.exports = {
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  context: resolve(__dirname, "../../src"),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ["awesome-typescript-loader"],
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
        ],
      },
      {
        test: /\.(scss|sass)$/,
        loaders: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
          "sass-loader",
        ],
      },
      {
        test: /\.jpe?g$|\.ico$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$|\.json$|\.xml$|\.png:Zone\.Identifier$/,
        loader: "file-loader?name=[name].[ext]", // <-- retain original file name
      },
    ],
  },
  plugins: [
    new CheckerPlugin(),
    new HtmlWebpackPlugin({ template: "index.html.ejs" }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "manifest.json", to: "." },
        { from: "*.png", to: "." },
        { from: "robots.txt", to: "." },
      ],
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
  },
  performance: {
    hints: false,
  },
};
