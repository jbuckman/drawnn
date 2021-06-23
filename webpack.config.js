const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (_env, argv) {
  const isProduction = argv.mode === 'production';
  const outputPath = isProduction ? 'build' : 'public';

  return {
    entry: './src/index.js',
    devServer: {
      contentBase: path.join(__dirname, 'public'),
    },
    devtool: 'inline-source-map',
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
              presets: [
                '@babel/preset-env',
                '@babel/preset-typescript',
              ],
              targets: {
                esmodules: true,
              },
            },
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    devServer: {
      contentBase: path.join(__dirname, 'public'),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
    ],
    output: {
      path: path.resolve(__dirname, outputPath),
      filename: 'bundle.js',
      clean: true,
    },
  };
};
