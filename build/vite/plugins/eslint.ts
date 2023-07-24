/**
 * @name  ConfigESLintPlugin
 * @description eslint插件
 */
import eslint from 'vite-plugin-eslint';

export const ConfigESLintPlugin = () => {
	return eslint({
		include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
		exclude: ['node_modules'],
		cache: false,
	});
};
