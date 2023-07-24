/**
 * @name createVitePlugins
 * @description 封装plugins数组统一调用
 */
import { PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import VitePluginCertificate from 'vite-plugin-mkcert';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';
import { ConfigSvgIconsPlugin } from './svgIcons';
import { AutoRegistryComponents } from './component';
import { AutoImportDeps } from './autoImport';
import { ConfigESLintPlugin } from './eslint';

export function createVitePlugins(isBuild: boolean) {
	const vitePlugins: (PluginOption | PluginOption[])[] = [
		// vue支持
		vue(),
		// JSX支持
		vueJsx(),
		// setup语法糖组件名支持
		vueSetupExtend(),
		// 提供https证书
		VitePluginCertificate({
			source: 'coding',
		}) as PluginOption,
	];

	// 自动按需引入组件
	vitePlugins.push(AutoRegistryComponents());

	// 自动按需引入依赖
	vitePlugins.push(AutoImportDeps());

	// 按需导入icons
	vitePlugins.push(ConfigSvgIconsPlugin(isBuild));

	// eslint插件
	vitePlugins.push(ConfigESLintPlugin());

	return vitePlugins;
}
