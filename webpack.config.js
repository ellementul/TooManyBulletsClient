const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin")

module.exports = {
  mode: 'development',
  entry: {
    main: path.resolve(__dirname, './src/index.js'),
  },
  output: {
    path: path.resolve(__dirname, './docs'),
    filename: '[name].bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
        title: 'TMB Client',
        template: path.resolve(__dirname, './src/template.html'), // шаблон
        filename: 'index.html', // название выходного файла
    }),
    new CopyPlugin({
      patterns: [
        { from: "data/assets", to: "assets" }
      ],
      options: {
        concurrency: 100,
      },
    }),
  ],
}