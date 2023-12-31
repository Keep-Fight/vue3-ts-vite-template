import { get, post } from '@/utils/axios';
import { UserState } from '@/store/modules/user/types';
enum URL {
	login = '/user/login',
	logout = '/user/logout',
	profile = '/user/profile',
}

interface LoginRes {
	token: string;
}

export interface LoginData {
	username: string;
	password: string;
}

const getUserProfile = async () => get<UserState>({ url: URL.profile });
const login = async (data: LoginData) => post<any>({ url: URL.login, data });
const logout = async () => post<LoginRes>({ url: URL.logout });
export { getUserProfile, logout, login };
