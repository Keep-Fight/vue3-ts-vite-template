import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
// import routes from 'virtual:generated-pages';

// routes.push({
// 	path: '/',
// 	redirect: '/login',
// });

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: '',
		component: () => import('../components/Layout/index.vue'),
		// 重定向
		redirect: '/login',
		children: [
			// // 首页
			// {
			// 	path: 'home',
			// 	name: 'Home',
			// 	component: () => import('@/views/Home/index.vue'),
			// },
		],
	},

	// {
	// 	path: '/register',
	// 	name: 'Register',
	// 	component: () => import('../views/Register/index.vue'),
	// },
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/views/login/index.vue'),
	},
];

//导入生成的路由数据
const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

export default router;
