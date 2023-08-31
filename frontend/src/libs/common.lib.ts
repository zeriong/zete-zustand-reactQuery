import css from 'dom-css';
import {useAuthStore} from '../store/authStore';
import {apiBundle} from '../openapi/api';
import {useMemoStore} from '../store/memoStore';
import {queryClient} from '../queryClient';

/* --------------------------- 커스텀스크롤 function start ----------------------------- */
export const getInnerHeight = (el: HTMLDivElement) => {
    const { clientHeight } = el;
    const { paddingTop, paddingBottom } = getComputedStyle(el);
    return clientHeight - parseFloat(paddingTop) - parseFloat(paddingBottom);
}

export const getInnerWidth = (el: HTMLDivElement) => {
    const { clientWidth } = el;
    const { paddingLeft, paddingRight } = getComputedStyle(el);
    return clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight);
}

let scrollbarWidth: boolean | number = false;

export const getScrollbarWidth = (cacheEnabled = true) => {
    if (cacheEnabled && scrollbarWidth !== false) return scrollbarWidth;
    if (typeof document !== 'undefined') {
        const div = document.createElement('div');
        css(div, {
            width: 100,
            height: 100,
            position: 'absolute',
            top: -9999,
            overflow: 'scroll',
            MsOverflowStyle: 'scrollbar',
        });
        document.body.appendChild(div);
        scrollbarWidth = div.offsetWidth - div.clientWidth;
        document.body.removeChild(div);
    } else {
        scrollbarWidth = 0;
    }
    return scrollbarWidth || 0;
}

export const isString = (maybe: string | number) => typeof maybe === 'string';

export const returnFalse = () => false;

/* --------------------------- 커스텀스크롤 function end ----------------------------- */

/** 문자열이 정수로 이뤄져 있는지 확인하는 함수 */
export const isIntegerString = (s?: string) => {
    const n = parseFloat(s);
    return !isNaN(n) && Number.isInteger(n);
}

/** URL QueryParams 획득 함수 */
export const getQueryParams = () => {
    const url = window.location.href;
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    // 파라미터를 객체로 변환
    const queryParams = {};
    for (const [key, value] of params.entries()) {
        queryParams[key] = value;
    }

    return queryParams;
}

/** 로그아웃 함수 */
export const logout = () => {
    const authStore = useAuthStore.getState();
    const memoStore = useMemoStore.getState();
    (async () => {
        await apiBundle.auth.logout()
            .then((res) => {
                if (res.error) console.log(res.error);
            })
            .catch((e) => console.log(e));
        authStore.setLogout();
        memoStore.resetMemos();
        queryClient.removeQueries();
    })()
}