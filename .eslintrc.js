module.exports = {
	extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended', 'eslint-config-prettier'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json'
	},
	plugins: ['@typescript-eslint', 'prettier'],
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts']
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true
			},
			node: {
				extensions: ['.js', '.ts'],
				moduleDirectory: ['node_modules', 'src']
			}
		}
	},
	rules: {
		'import/no-extraneous-dependencies': [
			2,
			{ devDependencies: ['**/*.test.ts', '__tests__/**/*.ts'] }
		],
		'import/prefer-default-export': [0],
		'@typescript-eslint/indent': [0],
		'max-classes-per-file': [0],
		'max-len': ['error', { code: 120, ignoreTemplateLiterals: true }],
		'import/extensions': [
			'error',
			'ignorePackages',
			{
				js: 'never',
				ts: 'never'
			}
		],
		'arrow-parens': [2, 'as-needed'],
		'no-useless-constructor': [0],
		'no-unused-vars': [
			'warn',
			{
				ignoreRestSiblings: true
			}
		],
		'no-shadow': 'off', // https://github.com/typescript-eslint/typescript-eslint/issues/2471
		'@typescript-eslint/no-shadow': 'error',
		quotes: ['error', 'single', { avoidEscape: true }],
		'no-param-reassign': [0]
	},
	overrides: [
		{
			files: ['**/*.test.ts'],
			rules: {
				'dot-notation': 0,
				'@typescript-eslint/ban-ts-comment': 0
			}
		}
	],
	ignorePatterns: ['build/**/*', 'migrations/**/*'],
	env: {
		node: true,
		jest: true
	}
};
