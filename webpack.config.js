const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
 mode: 'development',
 devtool: 'eval',
  entry: "./src/main.js",
  watch:true,
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "build"),
  },
  plugins:[
    new HtmlWebpackPlugin(),
    new CopyWebpackPlugin({
        patterns: [
            { from: "./src/static" }
        ]
    })
  ],
   module: {
     rules: [
       {
         test: /\.js$/,
         exclude: /node_modules/
       },
       {
         test: /\.(gltf)$/,
         use: [
           {
             loader: "gltf-webpack-loader"
           }
         ]
       },
       {
         test: [/\.(bin)$/, /\.(jpg)$/, /\.(png)$/],
         use: [
           {
             loader: 'file-loader',
             options: {
               name: '[name]-[hash].[ext]'
             }
           }
         ]
       }
     ]
   },
};