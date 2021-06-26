const webpack = require('webpack'); // 用于访问内置插件
const VueLoaderPlugin = require('vue-loader/lib/plugin');//vue-loader自带的插件，必须使用
const CopyPlugin = require("copy-webpack-plugin");//将目标文件拷贝到打包后的指定位置


module.exports = {
    entry: './src/main.js',
    module: {
        rules: [
            { test: /\.vue$/, use: 'vue-loader' },
            {
                test: /\.css$/, use: [
                    'vue-style-loader', 'css-loader'
                ]
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "./src/*.html", to: "[name].[ext]" }
            ],
        })
    ]
};
