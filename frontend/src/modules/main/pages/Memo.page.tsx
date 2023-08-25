import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {AddMemo} from '../components/AddMemo';
import Masonry from 'react-masonry-css';
import * as DOMPurify from 'dompurify';
import {FillStarIcon, StarIcon} from '../../../common/components/Icons';
import {EditMemoModal} from '../components/modals/EditMemo.modal';
import {SavedMemoMenuPopover} from '../components/popovers/SavedMemoMenu.popover';
import {useSearchParams} from 'react-router-dom';
import {changeImportantAction} from '../../../store/memo/memo.actions';
import {resetMemosReducer} from '../../../store/memo/memo.slice';
import {HorizontalScroll} from '../../../common/components/HorizontalScroll';
import {loadMemos, sortByName} from '../../../libs/memo.lib';
import {getQueryParams} from '../../../libs/common.lib';
import {queryClient} from '../../../index';
import {SearchMemosOutput} from '../../../openapi/generated';
import {apiBundle} from '../../../openapi/api';
import {MEMO_LIST_REQUEST_LIMIT} from '../../../common/constants';
import {useInfiniteQuery, useQuery, useQueryClient} from '@tanstack/react-query';
import {SavedMemo} from '../components/SavedMemo';

export const MemoPage = () => {
    const observerRef = useRef<IntersectionObserver>(null);
    const loaderRef = useRef(null);

    const [searchParams] = useSearchParams();
    const [masonryCols] = useState({
        default: 7,
        2544: 6,
        2222: 5,
        1888: 4,
        1566: 3,
        1234: 2,
        767: 1,
    });

    // 페이지를 사용하지 않고 구현하였기 때문에 pageParam 사용 X
    // 리액트쿼리를 사용한 무한스크롤 구현
    const searchMemosQuery = useInfiniteQuery(['memo/searchMemos'], async () => {
        return await apiBundle.memo.searchMemos({
            cate: searchParams.get('search') ? undefined : searchParams.get('cate'),
            tag: searchParams.get('search') ? undefined : searchParams.get('tag'),
            search: searchParams.get('search') ? decodeURI(searchParams.get('search')) : undefined,
            offset: memoList?.length,
            limit: MEMO_LIST_REQUEST_LIMIT,
        })
    }, {
        getNextPageParam: (data) => {
            // 별도의 페이지가 존재하지않기 때문에 fetch할 데이터가 있다면 true, 없다면 undefined를 반환
            if (memoList?.length === data.totalCount) return undefined;
            return true;
        },
    });

    // 페이지단위로 들어오는 메모를 평탄화하여 저장
    var memoList = useMemo(() => {
        return searchMemosQuery.data?.pages.map(page => page.list).flat()
            .sort((a, b) => new Date(b.updateAt).valueOf() - new Date(a.updateAt).valueOf());
    }, [searchMemosQuery.data]);

    // 옵저버에 의해 센서가 노출되어 있음을 인식한 경우에 실행
    const handleObserver = async (entities, observer) => {
        const target = entities[0];
        if (target.isIntersecting && searchMemosQuery.hasNextPage) {
            await searchMemosQuery.fetchNextPage();
        }
    }

    // 카테고리, 태그, 검색에 의한 url 변화에 따른 처리
    useEffect(() => {
        if (observerRef.current) {
            (async () => {
                // 옵저버 & 메모리스트 초기화 후 로드
                searchMemosQuery.remove()
                await searchMemosQuery.refetch();
            })()
        }
    },[searchParams.get('cate'), searchParams.get('tag'), searchParams.get('search')]);

    useEffect(() => {
        // 이미 존재한다면 종료
        if (observerRef.current) observerRef.current.disconnect();

        const options = {
            root: null, // viewport를 root로 설정
            rootMargin: '20px', // 타겟의 교차상태를 판단할 때, 타겟의 마진을 추가로 고려
            threshold: 0.2, // 타겟이 viewport에 20% 이상 보이면 교차상태로 판단 (사용자경험 + 중요메모에는 메모 폼이 없어 위치변경 문제발생을 해결하기 위함.)
        };

        observerRef.current = new IntersectionObserver(handleObserver, options);

        if (loaderRef.current) observerRef.current.observe(loaderRef.current);

        return () => observerRef && observerRef.current.disconnect();

    }, [searchMemosQuery.data]);

    return (
        <>
            {/** 테스트 요소 */}
            <div onClick={ () => console.log('test') } className='fixed p-[40px] bg-white border z-50'> test </div>
            <section className='relative top-0 gap-[28px] w-full p-[16px] pt-[60px] md:p-[30px]'>
                {searchParams.get('cate') !== 'important' && (
                    <div className='relative flex justify-center mt-[6px] mb-[22px] md:mb-[30px] md:mt-0'>
                        <AddMemo/>
                    </div>
                )}
                <Masonry
                    breakpointCols={ masonryCols }
                    className='my-masonry-grid flex justify-center gap-x-[16px] md:gap-x-[30px]'
                    columnClassName='my-masonry-grid_column'
                >
                    {memoList?.map((memo, idx) => (
                        <SavedMemo key={ String(memo.id) + idx } memo={ memo }/>
                    ))}
                </Masonry>
                <EditMemoModal/>
                <div className='relative'>
                    <div ref={ loaderRef } className='absolute left-0 -top-[150px] w-[1px] h-[150px]'/>
                </div>
            </section>
        </>
    )
}

// import React, {useEffect, useRef, useState} from 'react';
// import {useDispatch, useSelector} from 'react-redux';
// import {AppDispatch, RootState} from '../../../store';
// import {AddMemo} from '../components/AddMemo';
// import Masonry from 'react-masonry-css';
// import * as DOMPurify from 'dompurify';
// import {FillStarIcon, StarIcon} from '../../../common/components/Icons';
// import {EditMemoModal} from '../components/modals/EditMemo.modal';
// import {SavedMemoMenuPopover} from '../components/popovers/SavedMemoMenu.popover';
// import {useSearchParams} from 'react-router-dom';
// import {changeImportantAction} from '../../../store/memo/memo.actions';
// import {resetMemosReducer} from '../../../store/memo/memo.slice';
// import {HorizontalScroll} from '../../../common/components/HorizontalScroll';
// import {loadMemos} from '../../../libs/memo.lib';
// import {getQueryParams} from '../../../libs/common.lib';
// import {queryClient} from '../../../index';
// import {SearchMemosOutput} from '../../../openapi/generated';
// import {apiBundle} from '../../../openapi/api';
// import {MEMO_LIST_REQUEST_LIMIT} from '../../../common/constants';
// import {useQuery} from '@tanstack/react-query';
//
// export const MemoPage = () => {
//     const observerRef = useRef<IntersectionObserver>(null);
//     const loaderRef = useRef(null);
//
//     const [searchParams, setSearchParams] = useSearchParams();
//
//     const memoState = useSelector((state: RootState) => state.memo);
//     const dispatch = useDispatch<AppDispatch>();
//
//     const [masonryCols] = useState({
//         default: 7,
//         2544: 6,
//         2222: 5,
//         1888: 4,
//         1566: 3,
//         1234: 2,
//         767: 1,
//     });
// // const searchMemos = useQuery<SearchMemosOutput>(['memo/searchMemos'], { enabled: false });
// // const offsetRef = useRef(0);
// //     /** text memo loader */
// //     const testLoadMemos = async (refresh) => {
// //         console.log('step - 1')
// //         const queryParams = getQueryParams();
// //         const searchMemos = queryClient.getQueryData<SearchMemosOutput>(['memo/searchMemos'])
// //         const totalCount = searchMemos?.totalCount;
// //         console.log('step - 2', totalCount)
// //         const cate = queryParams['cate'];
// //         const tag = queryParams['tag'];
// //         const search = queryParams['search'];
// //         console.log('step - 3')
// //         // refresh 여부에 따라 전체 데이터를 갱신 or 페이징 처리
// //         if (!searchMemos?.totalCount || offsetRef.current < totalCount) {
// //             console.log('step - 4: 진입')
// //             const getMemoList = await queryClient.setQueryData(['memo/searchMemos'], apiBundle.memo.searchMemos({
// //                 // 검색어가 있다면 카테고리, 태그 미적용
// //                 cate: search ? undefined : cate,
// //                 tag: search ? undefined : tag,
// //                 search: search ? decodeURI(search) : undefined,
// //                 offset: refresh ? 0 : offsetRef.current,
// //                 limit: refresh ? offsetRef.current : MEMO_LIST_REQUEST_LIMIT,
// //             }))
// //             console.log('step - 4: 데이터페치드', getMemoList)
// //             if (getMemoList.success) offsetRef.current += getMemoList.list.length;
// //         }
// //     }
// //
// //     useEffect(() => {
// //         console.log('한번은 될텐데', searchMemos.data)
// //     }, [searchMemos])
// //     useEffect(() => {
// //         (async () => await testLoadMemos(false))()
// //     }, [])
//
//     const selectMemo = (id) => {
//         searchParams.set('view', id);
//         setSearchParams(searchParams);
//     }
//
//     const changeMemoImportant = (memo) => {
//         dispatch(changeImportantAction({id: memo.id}));
//     }
//
//     // 옵저버에 의해 센서가 노출되어 있음을 인식한 경우에 실행
//     const handleObserver = async (entities, observer) => {
//         const target = entities[0];
//         if (target.isIntersecting) {
//             await loadMemos(false);
//         }
//     }
//
//     // 카테고리, 태그, 검색에 의한 url 변화에 따른 처리
//     useEffect(() => {
//         if (observerRef.current) {
//             (async () => {
//                 // 옵저버 & 메모리스트 초기화 후 로드
//                 dispatch(resetMemosReducer());
//                 await loadMemos(false);
//             })()
//         }
//     },[searchParams.get('cate'), searchParams.get('tag'), searchParams.get('search')]);
//
//     useEffect(() => {
//         if (memoState.memo.totalCount === -1 || memoState.memo.list.length < memoState.memo.totalCount) {
//             // 이미 존재한다면 종료
//             if (observerRef.current) observerRef.current.disconnect();
//
//             const options = {
//                 root: null, // viewport를 root로 설정
//                 rootMargin: '20px', // 타겟의 교차상태를 판단할 때, 타겟의 마진을 추가로 고려
//                 threshold: 0.2, // 타겟이 viewport에 20% 이상 보이면 교차상태로 판단 (사용자경험 + 중요메모에는 메모 폼이 없어 위치변경 문제발생을 해결하기 위함.)
//             };
//
//             observerRef.current = new IntersectionObserver(handleObserver, options);
//
//             if (loaderRef.current) observerRef.current.observe(loaderRef.current);
//         }
//
//         return () => observerRef && observerRef.current.disconnect();
//
//     }, [memoState.memo.list]);
//
//     return (
//         <>
//             {/** 테스트 요소 */}
//             {/*<div onClick={ () => console.log(searchMemos.data.list) } className='fixed p-[40px] bg-white border z-50'> test </div>*/}
//             <section className='relative top-0 gap-[28px] w-full p-[16px] pt-[60px] md:p-[30px]'>
//                 {searchParams.get('cate') !== 'important' && (
//                     <div className='relative flex justify-center mt-[6px] mb-[22px] md:mb-[30px] md:mt-0'>
//                         <AddMemo/>
//                     </div>
//                 )}
//                 <Masonry
//                     breakpointCols={ masonryCols }
//                     className='my-masonry-grid flex justify-center gap-x-[16px] md:gap-x-[30px]'
//                     columnClassName='my-masonry-grid_column'
//                 >
//                     {memoState.memo.list?.map((memo) => (
//                         <article
//                             key={ memo.id }
//                             className='relative max-w-[500px] w-full mb-[16px] md:w-[300px] md:mb-[30px] flex rounded-[8px] memo-shadow'
//                             onClick={ () => selectMemo(memo.id) }
//                         >
//                             <div
//                                 className='relative flex flex-col justify-between border w-full
//                                 border-gray-300/70 rounded-[8px] px-[18px] pb-[12px] pt-[14px] min-h-[212px] bg-memo break-words'
//                             >
//                                 <div className='flex relative w-full'>
//                                     <p
//                                         dangerouslySetInnerHTML={{ __html: memo.title && DOMPurify.sanitize(memo.title.replace(/\n/g, '<br/>')) }}
//                                         className={`text-gray-500 font-light text-[20px] text-start w-full mb-[10px] ${ !memo.title && 'h-[20px] w-full mb-[10px] pr-[30px]' }`}
//                                     />
//                                     {/* 중요메모 버튼 */}
//                                     <button
//                                         type='button'
//                                         className={ memo.title ? 'relative flex items-start' : 'absolute right-0' }
//                                         onClick={(e) => {
//                                             e.stopPropagation();
//                                             changeMemoImportant(memo);
//                                         }}
//                                     >
//                                         { memo.isImportant ? <FillStarIcon/> : <StarIcon/> }
//                                     </button>
//                                 </div>
//                                 <div className='items-end h-full w-full line-clamp-[14]'>
//                                     <p
//                                         dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(memo.content).replace(/\n/g, '<br/>') }}
//                                         className='text-start text-gray-500 font-light h-full w-full max-h-[336px]'
//                                     />
//                                 </div>
//                                 <div className='w-full flex'>
//                                     <div className='flex w-full items-center pr-[6px] overflow-hidden'>
//                                         <HorizontalScroll>
//                                             <ul className='flex w-full h-full relative pt-[8px] pb-[9px] overflow-y-hidden'>
//                                                 {memo.tags?.map((tag, idx) => (
//                                                     <li key={ idx } className='flex items-center px-[9px] py-[1px] mr-[4px] rounded bg-black bg-opacity-10 cursor-default'>
//                                                         <p className='font-light text-[11px] text-dark/90 whitespace-nowrap'>
//                                                             { tag.name }
//                                                         </p>
//                                                     </li>
//                                                 ))}
//                                             </ul>
//                                         </HorizontalScroll>
//                                     </div>
//                                     <div className='relative -bottom-[4px]'>
//                                         <SavedMemoMenuPopover memoId={ memo.id }/>
//                                     </div>
//                                 </div>
//                             </div>
//                         </article>
//                     ))}
//                 </Masonry>
//                 <EditMemoModal/>
//                 <div className='relative'>
//                     <div ref={ loaderRef } className='absolute left-0 -top-[150px] w-[1px] h-[150px]'/>
//                 </div>
//             </section>
//         </>
//     )
// }