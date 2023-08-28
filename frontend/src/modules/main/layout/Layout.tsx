import React, {useEffect, useMemo, useRef} from 'react';
import {Outlet, useLocation, useSearchParams} from 'react-router-dom';
import {Header} from './Header';
import {Aside} from './Aside';
import {CategoryIcon, TopScrollIcon} from '../../../common/components/Icons';
import {SearchMemo} from '../components/SearchMemo';
import CustomScroller from '../../../common/components/customScroller';
import {useWindowResize} from '../../../hooks/useWindowResize';
import {useLayoutStore} from '../../../store/layoutStore';
import {useQuery} from '@tanstack/react-query';
import {GetCategoriesOutput, User} from '../../../openapi/generated';

export const MemoLayout = () => {
    const customScrollerRef = useRef<CustomScroller>(null)

    const [searchParams] = useSearchParams();
    const location = useLocation();
    const getProfileQuery = useQuery<User>(['user/getProfile'], { enabled: false });
    const getCategoriesQuery = useQuery<GetCategoriesOutput>(['memo/getCategories'], { enabled: false });
    const windowResize = useWindowResize();

    const layoutStore = useLayoutStore();

    // useMemo를 통해서 URL QueryParams 변화에 따른 카테고리 이름을 알맞게 반환한다.
    const categoryName = useMemo(() => {
        const cate = searchParams.get('cate');
        if (!cate) return '전체메모';
        else if (cate === 'important') return '중요메모';
        else {
            const matchCate = getCategoriesQuery.data?.list?.find((cate) => Number(cate.id) === Number(searchParams.get('cate')))?.name;
            if (matchCate) return matchCate;
            return '카테고리가 존재하지않습니다.';
        }
    }, [searchParams, getCategoriesQuery.data]);

    // 사이즈 변화에 따른 사이드 네비게이션 활성화
    useEffect(() => {
        if (windowResize.width <= 920) {
            if (layoutStore.isShowSideNav) layoutStore.setShowSideNav(false);
        } else {
            if (!layoutStore.isShowSideNav) layoutStore.setShowSideNav(true);
        }
    },[windowResize]);

    return (!getProfileQuery.isLoading && getProfileQuery.data) &&
        <>
            <Header/>
            <Aside/>
            <main
                className={`${ layoutStore.isShowSideNav ? 'pl-0 md:ml-[256px]' : 'ml-0' }
                flex relative flex-col justify-center h-full max-h-[calc(100% - 46px)] text-center items-center mt-[46px] duration-300 ease-in-out`}
            >
                <div className='w-full h-full flex relative mt-[46px]'>
                    <header className='flex fixed top-[46px] h-[46px] items-center justify-between w-full ease-in-out duration-300 bg-white border-b border-gray-300/80 pl-[16px] md:pl-[20px]'>
                        <div className={`flex items-center  ${ categoryName === '카테고리가 존재하지않습니다.' && 'text-gray-400' }`}>
                            <div className='w-[16px] md:w-[20px] mr-[10px]'>
                                <CategoryIcon className=''/>
                            </div>
                            <p className='line-clamp-1'>
                                { categoryName }
                            </p>
                        </div>
                        <div className='block md:hidden pr-[16px]'>
                            <SearchMemo/>
                        </div>
                    </header>
                    <div className='w-full h-full bg-gray-100'>
                        <CustomScroller autoHide={ false } ref={ customScrollerRef }>
                            <Outlet context={ customScrollerRef }/>
                            {!location.pathname.includes('profile') &&
                                <button
                                    type="button"
                                    onClick={() => customScrollerRef.current.scrollTop()}
                                    className="fixed p-[16px] md:p-[20px] bg-black/80 bottom-[16px] md:bottom-[30px] right-[16px] md:right-[30px] z-20 rounded-full"
                                >
                                    <TopScrollIcon className='max-md:w-[24px] max-md:h-[24px]'/>
                                </button>
                            }
                        </CustomScroller>
                    </div>
                </div>
            </main>
        </>
}