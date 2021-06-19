module.exports = {
    entry:"./main.js",
    output:{
        filename:"main.js"
    },
    mode:"development",
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
    },
    module:{
        rules:[
            {
                test:/\.js$/,
                use:{
                    loader:'babel-loader',
                    options:{
                        presets:[ '@babel/preset-env' ],
                        plugins:[
                            ["@babel/plugin-transform-react-jsx",{pragma:'createElement'}]
                        ]
                    }
                }
            }
        ]
    }
}