/// <reference types="vite/client" />

// 导入自定义组件
declare module '*.vue' {
	import { DefineComponent } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

declare module 'virtual:*' {
	const result: any;
	export default result;
}
