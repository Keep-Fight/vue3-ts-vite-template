import router from './index';
import { clearToken, isLogin } from '../utils/auth';

import NProgress from 'nprogress'; // 导入 nprogress模块
import 'nprogress/nprogress.css'; // 导入样式，否则看不到效果
NProgress.configure({ showSpinner: true }); // 显示右上角螺旋加载提示

// 白名单
const whileList = ['/login', '/register'];

router.beforeEach((to: any, from: any, next: any) => {
	NProgress.start();
	//  白名单 有值 或者登陆过存储了token信息可以跳转 否则就去登录页面
	if (!isLogin()) {
		clearToken();
	}

	if (whileList.includes(to.path) || isLogin()) {
		next();
	} else {
		next({
			path: '/login',
		});
	}
});

router.afterEach(() => {
	NProgress.done();
});

export default router;
