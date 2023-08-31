import {exportApiDataFactory} from './generated';
import {API_URL} from '../common/constants';
import {useAuthStore} from '../store/authStore';
import axios, {InternalAxiosRequestConfig} from 'axios';
import {queryClient} from '../queryClient';

const REFRESH_TOKEN_PATH = '/auth/refresh';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
    config.headers['Authorization'] = `Bearer ${ useAuthStore.getState().accessToken }`;
    return config;
});

// 요청에 실패하여 에러를 발생시킨 경우
axiosInstance.interceptors.response.use((value: any) => value, async (error) => {
    const originalConfig = error.config;
    // accessToken 발급요청이 에러를 내면 무한루프에 빠짐
    if (error.config.url === REFRESH_TOKEN_PATH) return Promise.reject(error);

    // 권한 오류가 발생했고 재실행된(무한루프방지) 경우가 아니라면
    // 서버에 accessToken을 요청하고 서버는 요청을 받을때 헤더에 쿠키를 조회하고
    // 서버에서 쿠키에 저장하는 jwt가 적용된 refreshToken이 존재하면 accessToken을 발급.
    // 발급 이후에 아직 로그인상태가 아니기 때문에 retry하여 accessToken을 통해 로그인을 유지함.
    if (error.response?.status === 401 && !originalConfig.retry) {
        const authStore = useAuthStore.getState();
        try {
            const result = await apiBundle.auth.refreshToken();
            if (result?.success && result?.accessToken) {
                const token = result.accessToken;
                authStore.setLogin(token);

                originalConfig.headers['Authorization'] = `Bearer ${ authStore.accessToken }`;
                originalConfig.retry = true; // 아래 내용 처리 이후 해당 요청을 재실행

                return axiosInstance(originalConfig);
            } else {
                // 로그아웃상태에서 유저데이터가 존재하는 경우 캐싱데이터 모두 삭제
                authStore.setLogout();
                return Promise.reject(error);
            }
        } catch (e) {
            // 토큰발급 실패, 로그인정보 초기화 및 로그인창 이동
            authStore.setLogout();
            return Promise.reject(e);
        }
    }
    return Promise.reject(error);
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig<any>) => config,
    (error) => Promise.reject(error)
);

/** OpenAPI Autogen Ajax 매서드 */
export const apiBundle = exportApiDataFactory(axiosInstance);