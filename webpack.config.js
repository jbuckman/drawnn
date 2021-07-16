const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = function (_env, argv) {
  const isProduction = argv.mode === 'production';
  const outputPath = isProduction ? 'build' : 'public';

  return {
    entry: './src/index.js',
    devServer: {
      contentBase: path.join(__dirname, 'public'),
    },
    devtool: 'source-map',
    resolve: {
      extensions: ['.js', '.ts'],
    },
    module: {
      rules: [
        {
          test: /\.[jt]s$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript'],
              targets: {
                esmodules: true,
              },
            },
          },
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      new MiniCssExtractPlugin(),
    ],
    output: {
      path: path.resolve(__dirname, outputPath),
      filename: '[name].bundle.js',
      clean: true,
    },
  };
};
