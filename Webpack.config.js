const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { devDependencies } = require('./package.json')

// this function reads Zendesk Garden npm dependencies from package.json and
// creates a jsDelivr url
const zendeskGardenJsDelivrUrl = (function () {
  const pkg = Object.keys(devDependencies).filter((item) =>
    item.includes('@zendeskgarden/css')
  )
  const getPkgName = (url, pkg) => {
    const version = devDependencies[pkg]
      .replace(/^[\^~]/g, '')
      .replace(/\.\d$/, '')
    url = `${url}npm/${pkg}@${version},`
    return url
  }
  return (
    pkg.length &&
    pkg.reduce(getPkgName, 'https://cdn.jsdelivr.net/combine/').slice(0, -1)
  )
})()

const externalAssets = {
  css: [zendeskGardenJsDelivrUrl],
  js: [
    'https://assets.zendesk.com/apps/sdk/2.0/zaf_sdk.js',
    'https://kit.fontawesome.com/999bfae655.js'
  ]
}

module.exports = {
  entry: {
    app: [
      'babel-polyfill',
      './src/javascripts/locations/ticket_sidebar.js',
      './src/index.css'
    ]
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/assets')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: { loader: 'babel-loader' }
      },
      {
        type: 'javascript/auto',
        test: /\.json$/,
        include: path.resolve(__dirname, './src/translations'),
        use: './webpack/translations-loader'
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { url: false } },
          'postcss-loader'
        ]
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
      cleanOnceBeforeBuildPatterns: [
        '**/*',
        path.join(__dirname, 'dist/**/*')
      ]
    }),

    // Copy over static assets
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/translations/*', to: '../translations', flatten: true },
        { from: 'src/manifest.json', to: '../', flatten: true },
        { from: 'src/images/*', to: '.', flatten: true },
        { from: '.zat', to: '../', flatten: true }
      ]
    }),

    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),

    new HtmlWebpackPlugin({
      warning:
        'AUTOMATICALLY GENERATED FROM ./src/templates/iframe.html - DO NOT MODIFY THIS FILE DIRECTLY',
      vendorCss: externalAssets.css.filter((path) => !!path),
      vendorJs: externalAssets.js,
      template: './src/templates/iframe.html',
      filename: 'iframe.html'
    })
  ]
}
