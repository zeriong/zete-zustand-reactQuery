import React, {useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../../../store';
import {Outlet, useSearchParams} from 'react-router-dom';
import {Header} from './Header';
import {Aside} from './Aside';
import {CategoryIcon} from '../../../common/components/Icons';
import {SearchMemo} from '../components/SearchMemo';
import CustomScroller from '../../../common/components/customScroller';
import {useWindowResize} from '../../../hooks/useWindowResize';
import {useLayoutStore} from '../../../store/layoutStore';
import {useQuery} from '@tanstack/react-query';
import {User} from '../../../openapi/generated';

export const MemoLayout = () => {
    const [searchParams] = useSearchParams();

    const layoutStore = useLayoutStore();
    const memoState = useSelector((state: RootState) => state.memo);
    // const { loading, data } = useSelector((state: RootState) => state.user);

    const getProfile = useQuery<User>(['user/getProfile'], { enabled: false });

    const windowResize = useWindowResize();

    // useMemo를 통해서 URL QueryParams 변화에 따른 카테고리 이름을 알맞게 반환한다.
    const categoryName = useMemo(() => {
        const cate = searchParams.get('cate');
        if (!cate) return '전체메모';
        else if (cate === 'important') return '중요메모';
        else {
            const matchCate = memoState.cate.list.find((cate) => Number(cate.id) === Number(searchParams.get('cate')))?.name;
            if (matchCate) return matchCate;
            return '카테고리가 존재하지않습니다.';
        }
    }, [searchParams, memoState.cate]);

    // 사이즈 변화에 따른 사이드 네비게이션 활성화
    useEffect(() => {
        if (windowResize.width <= 920) {
            if (layoutStore.isShowSideNav) layoutStore.setShowSideNav(false);
        } else {
            if (!layoutStore.isShowSideNav) layoutStore.setShowSideNav(true);
        }
    },[windowResize]);

    return (!getProfile.isLoading && getProfile.data) &&
        <>
            <Header/>
            <Aside/>
            <main
                className={`${ layoutStore.isShowSideNav ? 'pl-0 md:pl-[256px]' : 'pl-0' }
                flex relative flex-col justify-center h-full text-center items-center pt-[46px] duration-300 ease-in-out`}
            >
                <div className='w-full h-full flex relative pt-[46px]'>
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
                        <CustomScroller autoHide={ false }>
                            <Outlet/>
                            {/*<div onClick={ () => window.scrollTo({ top: 0, behavior: 'smooth' }) } className='bg-red-500 text-white p-[20px] fixed right-[20px] bottom-[20px]' >test</div>*/}
                        </CustomScroller>
                    </div>
                </div>
            </main>
        </>
}