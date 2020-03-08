module.exports = {
    "presets": [
        "@vue/app",
        [
            '@babel/preset-env', {
                modules: false
            }
        ]
    ],
    "plugins": [
        "syntax-dynamic-import",
        [
            "component",
            {
                "libraryName": "element-ui",
                "styleLibraryName": "theme-chalk"
            }
        ]
    ]
};