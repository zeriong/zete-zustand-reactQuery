import {createSlice} from '@reduxjs/toolkit';
import {CategoryDto, Memo} from '../../openapi/generated';
import {
    changeImportantAction,
    createCategoryAction,
    updateCategoryAction,
    deleteCategoryAction,
    deleteMemoAction,
    getCategoriesAction,
    searchMemosAction,
} from './memo.actions';

interface IState {
    cate: {
        totalMemoCount?: number;
        importantMemoCount?: number;
        list?: CategoryDto[];
        isLoading: boolean;
    }
    memo: {
        offset?: number;
        totalCount?: number;
        list?: Memo[];
        isLoading: boolean;
    }
}
const initState: IState = {
    cate: {
        totalMemoCount: 0,
        importantMemoCount: 0,
        list: [],
        isLoading: false,
    },
    memo: {
        offset: 0,
        totalCount: -1,
        list: [],
        isLoading: false,
    }
}

export const memoSlice = createSlice({
    name: 'memo',
    initialState: initState,
    reducers: {
        resetMemosReducer: (state) => {
            state.memo.offset = 0;
            state.memo.totalCount = -1;
            state.memo.list = [];
        },
        saveMemoReducer: (state, { payload: memo }) => {
            state.memo.list = [...state.memo.list, memo].sort((a, b) => new Date(b.updateAt).valueOf() - new Date(a.updateAt).valueOf());
            state.memo.offset++;
        },
        updateMemoReducer: (state, { payload: updateMemo }) => {
            state.memo.list = state.memo.list.map((memo) => {
                if (memo.id === updateMemo.id) return updateMemo;
                return memo;
            }).sort((a, b) => new Date(b.updateAt).valueOf() - new Date(a.updateAt).valueOf());
        },
    },
    extraReducers: (builder) => {
        /* ======================= 카테고리 ====================== */

        // 카테고리 목록
        builder.addCase(getCategoriesAction.fulfilled, (state, { payload: data }) => {
            if (data.success) {
                state.cate.list = data.list.sort((a, b) => a.name > b.name ? 1 : -1);
                state.cate.totalMemoCount = data.totalMemoCount;
                state.cate.importantMemoCount = data.importantMemoCount;
            }
        });

        // 카테고리 생성
        builder.addCase(createCategoryAction.fulfilled, (state, { payload: data }) => {
            if (data.success) {
                state.cate.list = [...state.cate.list, data.savedCate]
                    .sort((a, b) => a.name > b.name ? 1 : -1);
            }
        });

        // 카테고리 업데이트
        builder.addCase(updateCategoryAction.fulfilled, (state, { payload: data, meta }) => {
            const input = meta.arg;
            if (data.success) {
                state.cate.list = state.cate.list.map((cate) => {
                    if (cate.id === input.id) {
                        cate.name = input.name;
                        return cate;
                    }
                    else return cate;
                }).sort((a, b) => a.name > b.name ? 1 : -1);
            }
        });

        // 카테고리 삭제
        builder.addCase(deleteCategoryAction.fulfilled, (state, { payload: data, meta }) => {
            const input = meta.arg;
            if (data.success) {
                state.cate.list = data.list.sort((a, b) => a.name > b.name ? 1 : -1);
                state.cate.totalMemoCount = data.totalMemoCount;
                state.cate.importantMemoCount = data.importantMemoCount;
                // 삭제된 카테고리 하위 메모 데이터 제외
                state.memo.list = state.memo.list.filter(memo => memo.cateId !== input.id) || [];
            }
        });

        /* ======================= 메모 ====================== */

        // 메모 목록 검색
        builder.addCase(searchMemosAction.pending, (state) => {
            state.memo.isLoading = true;
        });
        builder.addCase(searchMemosAction.fulfilled, (state, { payload: data, meta }) => {
            const refresh = meta.arg.refresh;
            const input = meta.arg.input;
            if (data?.success) {
                // refresh를 통해서 갱신, 스택 유형으로 업데이트
                state.memo.offset = input.offset + data.list.length;
                state.memo.totalCount = data.totalCount;
                state.memo.list = (refresh ? data.list : [ ...state.memo.list, ...data.list ])
                    .sort((a, b) => new Date(b.updateAt).valueOf() - new Date(a.updateAt).valueOf());
                state.memo.isLoading = false;
            }
        });
        builder.addCase(searchMemosAction.rejected, (state) => {
            state.memo.isLoading = false;
        });

        // 중요메모 설정
        builder.addCase(changeImportantAction.fulfilled, (state, { payload: data, meta }) => {
            const input = meta.arg;
            if (data.success) {
                state.memo.list = state.memo.list.map((memo) => {
                    if (memo.id === input.id) return { ...memo, isImportant: !memo.isImportant };
                    else return memo;
                })
                state.cate.importantMemoCount = data.totalImportantCount;
            }
        });

        // 메모 삭제
        builder.addCase(deleteMemoAction.fulfilled, (state, { payload: data, meta }) => {
            const input = meta.arg;
            if (data.success) {
                state.memo.list = state.memo.list.filter(memo => memo.id !== input.id)
                    .sort((a, b) => new Date(b.updateAt).valueOf() - new Date(a.updateAt).valueOf());
            }
        });
    }
});

export const { resetMemosReducer, saveMemoReducer, updateMemoReducer } = memoSlice.actions;