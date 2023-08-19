import {SearchIcon} from '../../../common/components/Icons';
import React, {useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import {showAlert} from '../../../store/alert/alert.actions';

export const SearchMemo = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // 폼 타입에 search를 추가한다.
    const form = useForm<{ search?: string }>();

    // 검색 내용을 URL QueryParams로 추가한다.
    const search = (text) => {
        if (text && text.length > 0) {
            searchParams.set('search', encodeURI(text));
            setSearchParams(searchParams);
        } else if (searchParams.has('search')) {
            searchParams.delete('search')
            setSearchParams(searchParams);
        }
    }

    // 서버에 검색내용이 포함된 메모를 요청
    const searchSubmit = form.handleSubmit(async data => search(data.search));

    // 검색 시 에러가 나는 경우는 255자 이상으로 검색했을때로 한정지어 팝업 알람을 띄운다.
    useEffect(() => {
        if (form.formState.errors.search) showAlert('메모검색은 255자 까지 가능합니다.');
    },[form.formState.errors.search]);

    return (
        <form
            onSubmit={ searchSubmit }
            onBlur={ searchSubmit }
            className='flex items-center w-[170px] md:w-[240px] px-[10px] py-[4px] text-[14px] md:border md:border-gray-300
            bg-gray-100 md:bg-white rounded-[4px] ml-[10px] md:m-0'
        >
            <input
                {...form.register('search', {
                    required: false,
                    minLength: 1, maxLength: 255,
                })}
                placeholder='메모검색'
                className='placeholder:italic placeholder:text-gray-500/95 placeholder:font-light w-full bg-transparent md:pr-0'
            />
            <button
                type='submit'
                className='flex items-center pl-[6px]'
            >
                <SearchIcon/>
            </button>
        </form>
    )
}