import * as DOMPurify from 'dompurify';
import {FillStarIcon, StarIcon} from '../../../common/components/Icons';
import {HorizontalScroll} from '../../../common/components/HorizontalScroll';
import {SavedMemoMenuPopover} from './popovers/SavedMemoMenu.popover';
import React from 'react';
import {useSearchParams} from 'react-router-dom';
import {GetCategoriesOutput, Memo} from '../../../openapi/generated';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {apiBundle} from '../../../openapi/api';
import {useMemoStore} from '../../../store/memoStore';

export const SavedMemo = (props: { memo: Memo }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const queryClient = useQueryClient();
    const changeImportantMutation = useMutation(apiBundle.memo.changeImportant);

    const memoStore = useMemoStore();

    const changeMemoImportant = () => {
        changeImportantMutation.mutate({id: props.memo.id}, {
            onSuccess: (data) => {
                queryClient.setQueryData<GetCategoriesOutput>(['memo/getCategories'],
                    (cateList) => ({ ...cateList, importantMemoCount: data.totalImportantCount }));
                memoStore.changeImportant(props.memo.id);
            },
        })
    }

    const selectMemo = (id) => {
        searchParams.set('view', id);
        setSearchParams(searchParams);
    }

    return (
        <article
            key={ props.memo.id }
            className='relative max-w-[500px] w-full mb-[16px] md:w-[300px] md:mb-[30px] flex rounded-[8px] memo-shadow'
            onClick={ () => selectMemo(props.memo.id) }
        >
            <div
                className='relative flex flex-col justify-between border w-full
                                border-gray-300/70 rounded-[8px] px-[18px] pb-[12px] pt-[14px] min-h-[212px] bg-memo break-words'
            >
                <div className='flex relative w-full'>
                    <p
                        dangerouslySetInnerHTML={{ __html: props.memo.title && DOMPurify.sanitize(props.memo.title.replace(/\n/g, '<br/>')) }}
                        className={`text-gray-500 font-light text-[20px] text-start w-full mb-[10px] ${ !props.memo.title && 'h-[20px] w-full mb-[10px] pr-[30px]' }`}
                    />
                    {/* 중요메모 버튼 */}
                    <button
                        type='button'
                        className={ props.memo.title ? 'relative flex items-start' : 'absolute right-0' }
                        onClick={(e) => {
                            e.stopPropagation();
                            changeMemoImportant();
                        }}
                    >
                        { props.memo.isImportant ? <FillStarIcon/> : <StarIcon/> }
                    </button>
                </div>
                <div className='items-end h-full w-full line-clamp-[14]'>
                    <p
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.memo.content).replace(/\n/g, '<br/>') }}
                        className='text-start text-gray-500 font-light h-full w-full max-h-[336px]'
                    />
                </div>
                <div className='w-full flex'>
                    <div className='flex w-full items-center pr-[6px] overflow-hidden'>
                        <HorizontalScroll>
                            <ul className='flex w-full h-full relative pt-[8px] pb-[9px] overflow-y-hidden'>
                                {props.memo.tags?.map((tag, idx) => (
                                    <li key={ idx } className='flex items-center px-[9px] py-[1px] mr-[4px] rounded bg-black bg-opacity-10 cursor-default'>
                                        <p className='font-light text-[11px] text-dark/90 whitespace-nowrap'>
                                            { tag.name }
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </HorizontalScroll>
                    </div>
                    <div className='relative -bottom-[4px]'>
                        <SavedMemoMenuPopover memoId={ props.memo.id }/>
                    </div>
                </div>
            </div>
        </article>
    )
}