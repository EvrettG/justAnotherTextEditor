const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const path = require('path');
const { InjectManifest } = require('workbox-webpack-plugin');

class RenamePlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('RenamePlugin', (compilation, callback) => {
      const regex = /^assets\/icons\/icon_\d+x\d+\.\w{8}\.png$/;

      for (const filename in compilation.assets) {
        if (regex.test(filename)) {
          const newFilename = filename.replace(/\.\w{8}\.png$/, '.png');
          compilation.assets[newFilename] = compilation.assets[filename];
          delete compilation.assets[filename];
        }
      }
      callback();
    });
  }
}

module.exports = () => {
  return {
    mode: 'development',
    entry: {
      main: './src/js/index.js',
      install: './src/js/install.js'
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      assetModuleFilename: 'assets/icons/[name][ext]', // Keep original filenames for assets in the icons folder
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        title: 'Just another text editor'
      }),
      new InjectManifest({
        swSrc: './src-sw.js',
        swDest: 'service-worker.js',
      }), 
      new WebpackPwaManifest({
        short_name: 'J.A.T.E.',
        name: 'Just another text editor',
        description: 'An alternative to notepad, with online and offline support',
        background_color: '#ffffff',
        theme_color: '#317EFB',
        start_url: '/',
        publicPath: '/',
        crossorigin: 'use-credentials', // can be null, use-credentials, or anonymous
        fingerprints: false, // Disable hashes for icons
        ios: true,
        icons: [
          {
            src: path.resolve('src/images/logo.png'),
            sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
            destination: path.join('assets', 'icons'),
          },
        ],
      }),
      new RenamePlugin(), // Add the custom plugin
    ],
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-proposal-object-rest-spread', '@babel/transform-runtime'],
            },
          },
        },
      ],
    },
  };
};