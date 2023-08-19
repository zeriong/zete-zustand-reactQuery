import axios, {AxiosRequestConfig} from 'axios';
import {exportApis} from './generated';
import {API_URL} from '../common/constants';
import {store} from '../store';
import {setLoginReducer, setLogoutReducer} from '../store/auth/auth.slice';

const REFRESH_TOKEN_PATH = '/auth/refresh';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
    config.headers['Authorization'] = `Bearer ${ store.getState().auth.accessToken }`;
    return config;
});

axiosInstance.interceptors.response.use((value: any) => value, async (error) => {
    const originalConfig = error.config;

    // accessToken 발급요청이 에러를 내면 무한루프에 빠짐
    if (error.config.url === REFRESH_TOKEN_PATH) return Promise.reject(error);

    // 권한 오류가 발생했고 재실행된(무한루프방지) 경우가 아니라면
    // 서버에 accessToken을 요청하고 서버는 요청을 받을때 헤더에 쿠키를 조회하고
    // 서버에서 쿠키에 저장하는 jwt가 적용된 refreshToken이 존재하면 accessToken을 발급한다.
    // 발급 이후에 아직 로그인상태가 아니기 때문에 retry하여 accessToken을 통해 로그인을 유지할 수 있다.
    if (error.response?.status === 401 && !originalConfig.retry) {
        try {
            const result = await Api.auth.refreshToken();
            if (result.data?.success && result.data?.accessToken) {
                const token = result.data.accessToken;
                store.dispatch(setLoginReducer(token));

                originalConfig.headers['Authorization'] = `Bearer ${ store.getState().auth.accessToken }`;
                originalConfig.retry = true; // 아래 내용 처리 이후 해당 요청을 재실행

                return axiosInstance(originalConfig);
            } else {
                store.dispatch(setLogoutReducer());
                return Promise.reject(error);
            }
        } catch (e) {
            // 토큰발급 실패, 로그인정보 초기화 및 로그인창 이동
            store.dispatch(setLogoutReducer());
            return Promise.reject(e);
        }
    }
    return Promise.reject(error);
});

axiosInstance.interceptors.request.use(
    (config: AxiosRequestConfig) => config,
    (error) => Promise.reject(error)
);

/** OpenAPI Autogen Ajax 매서드 */
export const Api = exportApis(axiosInstance);