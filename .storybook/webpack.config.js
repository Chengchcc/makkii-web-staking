
module.exports = ({ config, mode }) => {
    config = {
        ...config,
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
                            },
                        },]
                }
            ]
        },
    }
    config.resolve.extensions.push('.ts', '.tsx');
    return config;
};