const {merge} = require('webpack-merge');
const common = require('./webpack.config.js');

const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
	mode: 'production',
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					// Mangle: true,
					// compress: true,
					mangle: false,
					compress: false,
					output: {
						beautify: true
					}
				}
			})
		]
	}
});
