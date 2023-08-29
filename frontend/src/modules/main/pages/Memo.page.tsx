
/**
 *
 *    react-query 학습을 위해 1차적으로 useInfiniteQuery를 활용해 무한 스크롤을 구현하였으나
 *    복잡도가 지나치게 증가하여 부적합하다고 판단, zustand를 활용한 구현 방식으로 전환함
 *
 *    1. 통신 결과가 회차별로 각각 배열에 저장되어 하나의 목록으로 관리하기 어렵고
 *       select 옵션이 존재하나 캐시구조는 컨트롤 할 수 없어 한계가 존재함.
 *
 *    2. 1번의 이유로 목록에 데이터를 추가, 수정, 삭제하기 난해함
 *
 *    3. 목록에 존재하는 모든 데이터를 refresh 해야 하는 상황에 요구되는 코드의 복잡도 증가
 *
 * */

import React, {useEffect, useRef, useState} from 'react';
import {AddMemo} from '../components/AddMemo';
import Masonry from 'react-masonry-css';
import {EditMemoModal} from '../components/modals/EditMemo.modal';
import {useSearchParams} from 'react-router-dom';
import {SavedMemo} from '../components/SavedMemo';
import {loadMemos} from '../../../libs/memo.lib';
import {useMemoStore} from '../../../store/memoStore';

export const MemoPage = () => {
    const observerRef = useRef<IntersectionObserver>(null);
    const loaderRef = useRef<HTMLDivElement>(null);
    const memoSectionRef = useRef<HTMLElement>(null);

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

    const memoStore = useMemoStore();

    // 옵저버에 의해 센서가 노출되어 있음을 인식한 경우에 실행
    const handleObserver = async (entities) => {
        const target = entities[0];
        if (target.isIntersecting) {
            await loadMemos(false);
        }
    }

    // 카테고리, 태그, 검색에 의한 url 변화에 따른 처리
    useEffect(() => {
        if (observerRef.current) {
            (async () => {
                // 메모리스트 초기화
                memoStore.resetMemos();
            })()
        }
    },[searchParams.get('cate'), searchParams.get('tag'), searchParams.get('search')]);

    useEffect(() => {
        if (memoStore.totalCount === -1 || memoStore.list.length < memoStore.totalCount) {
            // 이미 존재한다면 종료
            if (observerRef.current) observerRef.current.disconnect();

            const options = {
                root: null, // viewport를 root로 설정
                rootMargin: '20px', // 타겟의 교차상태를 판단할 때, 타겟의 마진을 추가로 고려
                threshold: 0.2, // 타겟이 viewport에 20% 이상 보이면 교차상태로 판단 (사용자경험 + 중요메모에는 메모 폼이 없어 위치변경 문제발생을 해결하기 위함.)
            };

            observerRef.current = new IntersectionObserver(handleObserver, options);

            if (loaderRef.current) observerRef.current.observe(loaderRef.current);
        }
        return () => observerRef.current && observerRef.current.disconnect();

    }, [memoStore.list]);

    return (
        <>
            <section ref={ memoSectionRef } className='relative top-0 gap-[28px] w-full p-[16px] md:p-[30px] h-[calc(100%-46px)]'>
                {searchParams.get('cate') !== 'important' && (
                    <div className='relative flex justify-center mt-[6px] mb-[22px] md:mb-[30px] md:mt-0'>
                        <AddMemo memoSection={ memoSectionRef }/>
                    </div>
                )}
                <Masonry
                    breakpointCols={ masonryCols }
                    className='my-masonry-grid flex justify-center gap-x-[16px] md:gap-x-[30px]'
                    columnClassName='my-masonry-grid_column'
                >
                    {memoStore.list?.map( (memo, idx) => <SavedMemo key={String(memo.id) + idx} memo={memo}/> )}
                </Masonry>
                <EditMemoModal/>
                <div className='relative'>
                    <div ref={ loaderRef } className='absolute left-0 -top-[150px] w-[1px] h-[200px]'/>
                </div>
            </section>
        </>
    )
}