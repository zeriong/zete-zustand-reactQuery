import {useEffect} from 'react';

/**
 * 클릭한 영역이 첫번째 인자로 전달받은 ref가 포함된다면
 * 두번째 인자로 전달받은 callback을 실행시키는 hook이다.
 * */
export const useOutsideClick = (ref, callback) => {
    useEffect(() => {
        const handleOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                callback();
            }
        }
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('touchstart', handleOutside);

        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('touchstart', handleOutside);
        };
    },[]);
}