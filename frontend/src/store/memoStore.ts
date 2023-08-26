import {create} from 'zustand';
import {Memo, SearchMemosOutput} from '../openapi/generated';

interface IMemoStore {
    offset?: number;
    totalCount?: number;
    list?: Memo[];
    isLoading: boolean;
    resetMemos: () => void;
    addMemo: (memo: Memo) => void;
    addMemoList: (resData: SearchMemosOutput, reqOffset: number, refresh: boolean) => void;
    editMemo: (memo: Memo) => void;
    deleteMemo: (memoId: number) => void;
    changeImportant: (memoId: number) => void;
}

const sortByUpdateAt = (list) => list.sort((a, b) => new Date(b.updateAt).valueOf() - new Date(a.updateAt).valueOf());

/** memo 상태관리 store */
export const useMemoStore = create<IMemoStore>() ((setState) => ({
    offset: 0,
    totalCount: -1,
    list: [],
    isLoading: false,
    resetMemos: () => setState(() => ({
        offset: 0,
        totalCount: -1,
        list: [],
    })),
    addMemo: (memo) => setState((state) => ({
        list: sortByUpdateAt([...state.list, memo]),
        offset: state.offset + 1,
    })),
    addMemoList: (resData, reqOffset, refresh) => setState((state) => ({
        offset: reqOffset + resData.list.length,
        totalCount: resData.totalCount,
        isLoading: false,
        list: refresh ? resData.list : sortByUpdateAt([ ...state.list, ...resData.list ]),
    })),
    editMemo: (editedMemo) => setState((state) => ({
        list: sortByUpdateAt(
            state.list.map((memo) => {
                if (memo.id === editedMemo.id) return editedMemo;
                return memo;
            })),
    })),
    deleteMemo: (memoId) => setState((state) => ({
        list: sortByUpdateAt(state.list.filter(memo => memo.id !== memoId)),
    })),
    changeImportant: (memoId) => setState((state) => ({
        list: state.list.map((memo) => {
            if (memo.id === memoId) return { ...memo, isImportant: !memo.isImportant };
            else return memo;
        }),
    })),
}))