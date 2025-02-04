const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const OfflinePlugin = require('offline-plugin');



module.exports = (env = {}) => {
	const devMode = !env.production;
	const useHash = env.hash;
	return {
		mode: devMode ? 'development' : 'production',
		entry: {
			app: './src/js/app.js'
		},
		plugins: [
			new CleanWebpackPlugin({
				cleanStaleWebpackAssets: false,
				cleanOnceBeforeBuildPatterns: ['**/*', '!sw.js'],
			}),
			new HtmlWebpackPlugin({
				template: './src/index.html'
			}),
			new MiniCssExtractPlugin({
				// Options similar to the same options in webpackOptions.output
				// all options are optional
				filename: useHash ? '[name].[contenthash].css' : '[name].css',
				//filename: '[name].css',
				chunkFilename: useHash ? '[name].[contenthash].css' : '[name].css',
				//chunkFilename: '[name].css',
			}),
			new CopyPlugin([
				{
					from: 'src/images',
					to: 'images'
				},
				'src/manifest.webmanifest',
			]),
			new OfflinePlugin({
				ServiceWorker: {
					events: true,
					entry: './src/js/sw-template.js'
				},
				AppCache: {
					events: true
				},
				externals: [
					'./images/ideograph-1.png',
					'./images/ideograph-2.png',
					'./images/ideograph-3.png',
					'./images/ideograph-4.png',
					'./images/ideograph-5.png'
				],
				excludes: [
					'**/.*',
					'**/*.map',
					'**/*.gz',
					'images/[67]*.jpg',
				]
			})
		],
		module: {
			rules: [
				{
					test: /\.css$/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
							options: {
								hmr: devMode,
							},
						},
						{
							loader: 'css-loader'
						}
					]
				},
				{
					test: /\.m?js$/,
					exclude: [			
						/node_modules\\(?!(framework7|template7|dom7|lodash-es|date-fns|idb)\\).*/,
						/\\js\\sw-template\.js$/
					],
					//include: path.resolve(__dirname, 'src'),
					use: {
						loader: 'babel-loader'
					}
				},
				{
					test: /\.f7\.html$/,
					use: [
						'babel-loader',
						{
							loader: 'framework7-component-loader',
							options: {
							 	helpersPath: './src/template7-helpers-list.js',
								partialsPath: './src/pages/',
              	partialsExt: '.f7p.html'
							},
						},
					],
				},
				{
					test: /\.(png|jpg|jpeg|gif)$/,
					loader: 'file-loader',
	        options: {
						outputPath: 'images',
	          name: useHash ? '[name].[contenthash].[ext]' : '[name].[ext]'
						//name: '[name].[ext]'
					}
				},
				{
					test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
					loader: 'file-loader',
					options: {
						outputPath: 'fonts',
						name: useHash ? '[name].[contenthash].[ext]' : '[name].[ext]'
						//name: '[name].[ext]'
					}
				},
				{
        	test: /\.wkr\.js$/,
        	use: [
						//'babel-loader',
						{
							loader: 'worker-loader',
							options: {
								name: useHash ? '[name].[contenthash].js' :
								 								'[name].js'
								//name: '[name].js'
							}
						},
						'babel-loader',
					]
      	}
			]
		},
		devtool: devMode ? 'source-map' : false,
		output: {
			filename: useHash ? '[name].[contenthash].js' : '[name].js',
			//filename: '[name].js',
			chunkFilename: useHash ? '[name].[contenthash].js' : '[name].js',
			//chunkFilename: '[name].js',
			path: path.resolve(__dirname, devMode ? 'dev' : 'dist')//,
			//publicPath: path.resolve('/test/prayers.f7/',  devMode ? 'dev' : 'dist')
		},
		optimization: {
			moduleIds: 'hashed',
			runtimeChunk: 'single',
			splitChunks: {
				cacheGroups: {
					vendorJs: {
						test: /[\\/]node_modules[\\/].*\.m?js$/,
						name: 'vendors',
						chunks: 'all'
					},
					vendorCss: {
						test: /[\\/]node_modules[\\/].*\.css$/,
						name: 'vendors',
						chunks: 'all'
					}
				}
			},
			minimizer: [
				new TerserJSPlugin({
					terserOptions: {
	          safari10: true,
						mangle: { safari10: true },
						output: { safari10: true },
	        },
				}),
				new OptimizeCSSAssetsPlugin({})
			],
		},
		watchOptions: {
			ignored: ['src/images', 'node_modules']
		}
	};
};
