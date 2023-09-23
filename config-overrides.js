module.exports = function override(config, env) {
    config.resolve.fallback = {
        ...config.resolve.fallback, // if it already exists
        /*"stream": require.resolve("stream-browserify"),*/
        "Buffer": require.resolve("buffer"),
    };
    return config;
};
