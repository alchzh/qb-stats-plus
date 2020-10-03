const path = require('path');
const SizePlugin = require('size-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
	devtool: 'source-map',
	stats: 'errors-only',
	entry: {
		background: './src/scripts/background',
		options: './src/scripts/options',
		'content-script': './src/scripts/content-script',
		redirect: './src/scripts/redirect',
		statsplus: './src/styles/statsplus.scss'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
        test: /\.(sa|sc|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          'sass-loader'
        ],
      }
		]
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: '[name].js'
	},
	plugins: [
		new SizePlugin(),
		new CopyWebpackPlugin([
			{
				from: '**/*',
				context: 'src',
				ignore: ['*.js', '*.svg', 'styles/*', 'jsconfig.json']
			},
			{
				from: 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'
			}
		]),
		new MiniCssExtractPlugin({
      filename: '[name].css',
		}),
		{
      apply(compiler) {
        compiler.hooks.shouldEmit.tap('Remove styles from output', (compilation) => {
          delete compilation.assets['statsplus.js'];
          return true;
        })
      }
    }
	],
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					mangle: false,
					compress: false,
					output: {
						beautify: true,
						indent_level: 2 // eslint-disable-line camelcase
					}
				}
			})
		]
	}
};
