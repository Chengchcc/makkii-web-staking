/* eslint-disable import/no-extraneous-dependencies */

const HtmlPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const path = require('path');
const baseapi = process.env.BASE_API;
const network = process.env.NETWORK;
const isDev = process.argv.indexOf('--mode=development') > -1;
const template = path.join(__dirname, '../public/index.html');
const { RELEVANT_PATH } = process.env;
const publicPath = RELEVANT_PATH ? `/${RELEVANT_PATH}/` : '/';
const { execSync } = require("child_process")
const currentVersion = execSync("git describe --always --dirty=-modified", { encoding: "utf-8" });
module.exports = {
  entry: {
    bundle: './src/index.tsx'
  },
  output: {
    path: path.join(__dirname, '../dist'),
    filename: isDev ? '[name].js' : '[name].[hash:8].js',
    chunkFilename: isDev ? '[name].js' : '[name]-[id].[hash:8].js',
    publicPath,
  },
  // Enable sourcemaps for debugging webpack's output.
  devtool: isDev && 'source-map',
  resolve: {
    // Add '.js' and '.jsx' as resolvable extensions.
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, "../src"),
      '@pages': path.resolve(__dirname, "../src/pages"),
      '@less': path.resolve(__dirname, "../src/less"),
      '@components': path.resolve(__dirname, "../src/components"),
      '@reducers': path.resolve(__dirname, "../src/reducers"),
      '@actions': path.resolve(__dirname, "../src/actions"),
      '@utils': path.resolve(__dirname, "../src/utils"),
      '@interfaces': path.resolve(__dirname, "../src/interfaces"),
      '@img': path.resolve(__dirname, "../src/img")
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[hash:8].css',
      chunkFilename: '[name]-[id].[hash:8].css',
    }),
    new CleanWebpackPlugin(),
    new HtmlPlugin({
      title: 'Aion Staking',
      filename: 'index.html',
      template,
      meta: !isDev ? { "Cache-Control": { "http-equiv": "Content-Security-Policy", content: "upgrade-insecure-requests" } } : false
    }),
    new webpack.DefinePlugin({
      BASENAME: JSON.stringify(RELEVANT_PATH),
      BASEAPI: JSON.stringify(baseapi),
      NETWORK: JSON.stringify(network),
      CURRENTVERSION: JSON.stringify(currentVersion)
    }),
  ],
  module: {
    rules: [
      { test: /\.(js|jsx|ts|tsx)$/, exclude: /node_modules/, use: ['babel-loader'] },
      {
        test: [/\.less$/], use: [
          process.argv.some(v => v.indexOf("webpack-dev-server") > -1) ?
            'style-loader' :
            MiniCssExtractPlugin.loader,
          {
            loader: require.resolve('css-loader'),
          },
          {
            loader: require.resolve('less-loader'),
            options: {
              javascriptEnabled: true
            }
          },
        ]
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url-loader?limit=8192'
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader'
          },
          {
            loader: '@svgr/webpack',
            options: { babel: false },
          }
        ],
      },
    ]
  },
  optimization: isDev ? {} : {
    runtimeChunk: {
      name: "manifest"
    },
    splitChunks: {
      chunks: 'all'
    }
  },
  devServer: {
    http2: !isDev ? true : false,
    historyApiFallback: true,
    contentBase: path.join(process.cwd(), './dist'),
    open: true,
    host: '0.0.0.0',
    port: 8080,
    publicPath,
  },
};
