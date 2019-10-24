/* eslint-disable import/no-extraneous-dependencies */

const HtmlPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpack = require('webpack');
const path = require('path');

const mode = process.env.NODE_ENV;
const baseapi = process.env.BASE_API;
const isAnaylize = process.env.ANALYZE;
const isDev = mode === 'development';
const template = path.resolve(__dirname, '../public/index.html');
const { RELEVANT_PATH } = process.env;
const publicPath = RELEVANT_PATH?`/${RELEVANT_PATH}/`:'/';
const analyzerPlugin = isAnaylize ? [new BundleAnalyzerPlugin()] : [];
module.exports = {
  entry: {
    bundle: './src/index.tsx'
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
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
    ...analyzerPlugin,
    new HtmlPlugin({
      title: 'Aion staking',
      filename: 'index.html',
      template
    }),
    new ExtractTextPlugin({
      filename: "[name].[contenthash].css",
      disable: isDev,
    }),
    new webpack.DefinePlugin({
      BASENAME: JSON.stringify(RELEVANT_PATH),
      BASEAPI: JSON.stringify(baseapi),
    }),
  ],
  module: {
    rules: [
      { test: /\.(js|jsx|ts|tsx)$/, exclude: /node_modules/, use: ['babel-loader'] },
      {
        test: [/\.less$/, /\.css$/], use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: require.resolve('less-loader'),
            options: {
              importLoaders: 1,
              javascriptEnabled: true
            },
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
  mode, // 'production' or 'development' webpack mode
  devServer: {
    // http2: true,
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, '../dist'),
    open: true,
    host: '0.0.0.0',
    port: 8080,
    publicPath,
  },
};
