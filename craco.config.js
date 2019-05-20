module.exports = {
    webpack: {
        configure: {
            target: 'electron-renderer'
        },
        plugins: [
        ]
    },
    babel: {
        plugins: [
            ["@babel/plugin-proposal-decorators", { "legacy": true }],
            ["@babel/plugin-proposal-class-properties", { "loose": true}],
            "@babel/plugin-transform-react-inline-elements",
            "@babel/plugin-transform-react-constant-elements"
        ]
    }
};
