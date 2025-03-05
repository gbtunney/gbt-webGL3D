import { EsLint } from '@snailicide/build-config'
import tsEslint from 'typescript-eslint'
import url from 'node:url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const FLAT_CONFIG = await EsLint.flatConfig(__dirname)

export default [
    ...FLAT_CONFIG,
    {
        ignores: ['**/.history/**', '**/*.map'],
    },
    ...tsEslint.config({
        extends: [tsEslint.configs.disableTypeChecked],
        files: ['**/*.js', '**/*.d.*'],
        rules: {},
    }),
    {},
]
