import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['node_modules/', 'vendor/', 'public/', 'var/', 'doc/'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...vue.configs['flat/recommended'],
    {
        files: ['**/*.{ts,vue}'],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                parser: tseslint.parser,
                extraFileExtensions: ['.vue'],
                sourceType: 'module',
            },
        },
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
            'vue/multi-word-component-names': 'off',
            'vue/block-lang': ['error', { script: { lang: 'ts' } }],
        },
    },
    {
        files: ['**/*.js'],
        languageOptions: { globals: globals.browser },
    },
    {
        files: ['*.config.{js,ts}'],
        languageOptions: { globals: globals.node },
    },
    prettier,
);
