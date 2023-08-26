import {getQueryParams, isIntegerString} from './common.lib';
import {MEMO_LIST_REQUEST_LIMIT} from '../common/constants';
import {api} from '../openapi/api';
import {useToastsStore} from '../common/components/Toasts';
import {useMemoStore} from '../store/memoStore';

/** URL QueryParams기준으로 카테고리 id를 반환하는 함수 */
export const getCategoryId = (searchParams): number => {
    return isIntegerString(searchParams.get('cate')) ? Number(searchParams.get('cate')) : 0;
}

/** 태그 삭제 함수 */
export const deleteMemoTag = (form, name) => {
    const tags = form.getValues('tags');
    if (tags) form.setValue('tags', tags.filter(tag => tag.name !== name));
}

/** 태그 추가 submit 함수 */
export const addMemoTagSubmit = (event, form) => {
    event.preventDefault();

    const input = event.target[0];
    const value = input?.value;
    if (!value) return;

    const tags = form.getValues('tags') || [];
    const exists = tags.find(tag => tag.name === value);

    if (exists) return useToastsStore.getState().addToast('.이미 존재하는 태그명 입니다.');

    form.setValue('tags', [ ...tags, { name: input.value } ]);
    input.value = '';
}

/** 메모작성의 제목 input에서 enter입력시 내용으로 이동하는 함수 */
export const focusToContent = (event) => {
    event.preventDefault();
    // 제목 -> 내용 포커싱
    const input = event.target[2];
    input.focus();
}

/** URL QueryParams에 따른 메모리스트를 요청하는 함수 */
export const loadMemos = (refresh) => {
    const queryParams = getQueryParams();
    const memoStore = useMemoStore.getState();
    const totCount = memoStore.totalCount;

    const cate = queryParams['cate'];
    const tag = queryParams['tag'];
    const search = queryParams['search'];

    // refresh 여부에 따라 전체 데이터를 갱신 or 페이징 처리
    if (!memoStore.isLoading && (refresh || memoStore.totalCount === -1 || memoStore.offset < totCount)) {
        const input = {
            // 검색어가 있다면 카테고리, 태그 미적용
            cate: search ? undefined : cate,
            tag: search ? undefined : tag,
            search: search ? decodeURI(search) : undefined,
            offset: refresh ? 0 : memoStore.offset,
            limit: refresh ? memoStore.list.length : MEMO_LIST_REQUEST_LIMIT,
        }
        api.memo.searchMemos(input)
            .then(res => memoStore.addMemoList(res.data, input.offset, refresh))
            .catch(e => console.log(e));
    }
}