import {create} from 'zustand';

interface ILayoutStore {
    isShowSideNav: boolean;
    toggleSideNav: () => void;
    setShowSideNav: (boolean) => void;
}
/** sideNav의 상태관리 store */
export const useLayoutStore = create<ILayoutStore>() ((setState) => ({
    isShowSideNav: true,
    toggleSideNav: () => setState((state) => ({ isShowSideNav: !state.isShowSideNav })),
    setShowSideNav: (value) => setState(() => ({ isShowSideNav: value })),
}))