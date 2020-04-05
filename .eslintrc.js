module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es6: true
    },
    extends: [
        'plugin:vue/essential',
        'eslint:recommended'
    ],
    plugins: [
        'html',
        'vue'
    ],
    rules: {
        'no-console': 'off',
        'no-prototype-builtins': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-unused-vars': 'off',
        'no-case-declarations': 'off',
        'semi':['error','always'],
        'indent': ['error', 4],
        'no-constant-condition': 'off'
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}
  