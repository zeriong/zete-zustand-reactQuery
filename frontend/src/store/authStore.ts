import {create} from 'zustand';

// TODO: loading state는 리액트쿼리로 컨버팅 시 fix해야 할 요소
interface IAuthStore {
    isLoggedIn: boolean;
    accessToken: string;
    loading: boolean | undefined;
    setLogin: (token:string) => void;
    setLogout: () => void;
}

/** 인증에 대한 상태관리 store */
export const useAuthStore = create<IAuthStore>() ((setState) => ({
    isLoggedIn: false,
    accessToken: '',
    loading: true,
    setLogin: (token: string) => setState(() => ({ accessToken: token, isLoggedIn: true, loading: false })),
    setLogout: () => setState(() => ({ accessToken: '', isLoggedIn: false, loading: false })),
}))