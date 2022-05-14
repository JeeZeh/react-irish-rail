// shared config (dev and prod)
const { resolve } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MomentLocalesPlugin = require("moment-locales-webpack-plugin");

module.exports = {
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  context: resolve(__dirname, "../../src"),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
        ],
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
          "sass-loader",
        ],
      },
      {
        test: /\.jpe?g$|\.ico$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$|\.json$|\.xml$/,
        loader: "file-loader",
        options: "name=[name].[ext]", // <-- retain original file name
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "index.html.ejs" }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "manifest.json", to: "." },
        { from: "*.png", to: "." },
        { from: "robots.txt", to: "." },
      ],
    }),

    // Or: To strip all locales except “en”, “es-us” and “ru”
    // (“en” is built into Moment and can’t be removed)
    new MomentLocalesPlugin({
      localesToKeep: ["en-ie"],
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
