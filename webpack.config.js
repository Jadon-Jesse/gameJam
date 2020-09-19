const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
 mode: 'development',
 devtool: 'eval',
  entry: "./src/main.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "build"),
  },
  plugins:[
    new HtmlWebpackPlugin()
  ]
};