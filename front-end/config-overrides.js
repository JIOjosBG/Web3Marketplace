const { ProvidePlugin } = require('webpack');

module.exports = function (config, env) {
    return {
        ...config,
        module: {
            ...config.module,
            rules: [
                ...config.module.rules,
                {
                    test: /.(m?js|ts|tsx)$/,
                    enforce: 'pre',
                    use: ['source-map-loader'],
                },
            ],
        },
        plugins: [
            ...config.plugins,
            new ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer'],
            }),
        ],
        resolve: {
            ...config.resolve,
            fallback: {
                "stream": require.resolve('readable-stream'),
                "crypto": require.resolve('crypto-browserify'),
            },
        },
        ignoreWarnings: [/Failed to parse source map/],
    };
};