import React, {useMemo} from 'react';
import CustomScroller from '../../../common/components/customScroller';
import {EditCategoryModal} from '../components/modals/EditCategory.modal';
import {Link, To, useSearchParams} from 'react-router-dom';
import {AllIcon, CategoryIcon, StarIcon, TagIcon} from '../../../common/components/Icons';
import {Tag} from '../../../openapi/generated';
import {useLayoutStore} from '../../../store/layoutStore';
import {useQuery} from '@tanstack/react-query';
import {apiBundle} from '../../../openapi/api';

export const Aside = () => {
    const getCategoriesQuery = useQuery(['memo/getCategories'], apiBundle.memo.getCategories, {
        select: (data) => {
            data.list.sort((a, b) => a.name > b.name ? 1 : -1);
            return data;
        },
    });

    const layoutStore = useLayoutStore();

    return (
        <>
            <section
                onClick={ () => layoutStore.toggleSideNav() }
                className={`z-50 w-full h-full left-0 top-0 fixed bg-black block md:hidden ease-in-out duration-300
                ${ layoutStore.isShowSideNav ? 'opacity-50 visible' : 'opacity-0 invisible' }`}
            />
            <aside
                className={`fixed w-[256px] bg-white z-50 md:z-20 ease-in-out duration-300 h-full top-0 md:top-[46px]
                overflow-hidden border-r border-gray-300/80
                ${ layoutStore.isShowSideNav ? 'left-0' : '-left-[256px]' }`}
            >
                <CustomScroller customTrackVerticalStyle={{ width: 5 }}>
                    <section className='h-full w-full p-[14px] text-dark font-light text-[14px]'>
                        <div className='h-fit pb-[12px]'>
                            <ul className='flex flex-col justify-center gap-[4px]'>
                                <CateItemList
                                    to={{ pathname: '/memo' }}
                                    cateId={ null }
                                    cateName='전체메모'
                                    iconComponent={ AllIcon }
                                    iconClassName='mr-[14px] w-[20px]'
                                    count={ getCategoriesQuery.data?.totalMemoCount }
                                />
                                <CateItemList
                                    to={{ pathname: '/memo', search: '?cate=important' }}
                                    cateId={ null }
                                    cateName='중요메모'
                                    iconComponent={ StarIcon }
                                    iconClassName='mr-[14px] w-[20px]'
                                    count={ getCategoriesQuery.data?.importantMemoCount }
                                />
                            </ul>
                            <p className='text-dark/90 text-[11px] font-light pb-[14px] pt-[17px] pl-[12px]'>
                                카테고리
                            </p>
                            <ul className='grid gap-[4px]'>
                                {getCategoriesQuery.data?.list?.map((cate, idx) => (
                                    <CateItemList
                                        key={ idx }
                                        to={{ pathname: '/memo', search: `?cate=${cate.id}` }}
                                        cateId={ String(cate.id) }
                                        cateName={ cate.name }
                                        iconComponent={ CategoryIcon }
                                        iconClassName='mr-[10px] mt-[4px] min-w-[21px]'
                                        tags={ cate.tags }
                                        count={ cate.memoCount }
                                    />
                                ))}
                            </ul>
                            <EditCategoryModal buttonText={ getCategoriesQuery.data?.list?.length > 0 ? '카테고리 수정' : '카테고리 추가' }/>
                        </div>
                    </section>
                </CustomScroller>
            </aside>
        </>
    )
}

const CateItemList = (props: { to: To, iconComponent: any, iconClassName: string, cateName: string, cateId: string, count: number, tags?: Tag[] }) => {
    const [searchParams] = useSearchParams();

    const isActiveCate = useMemo(() => {
        const cate = searchParams.get('cate');
        if (props.cateName === '전체메모') return !cate;
        if (props.cateName === '중요메모') return cate === 'important';
        if (props.cateId) return cate === String(props.cateId);
    },[searchParams]);

    return (
        <li className={`font-bold group rounded-[5px] hover:bg-gray-200/60 ${ isActiveCate && 'bg-gray-200/60' }`}>
            <Link
                to={ props.to }
                className='flex w-full justify-between items-center p-[10px] hover:bg-gray-200/60 rounded-[5px]'
            >
                <div
                    className={`flex justify-start w-full font-light transition-all duration-150
                    ${ props.cateId ? 'items-start' : 'items-center' }`}
                >
                    <props.iconComponent className={ props.iconClassName }/>
                    <p>{ props.cateName }</p>
                </div>
                <div className={`rounded-full text-dark/80 py-[2px] px-[8px] text-[12px] font-medium ${ isActiveCate ? 'bg-white' : 'group-hover:bg-white bg-gray-200/60' }`}>
                    <p className='relative bottom-[1px]'>
                        { props.count || 0 }
                    </p>
                </div>
            </Link>
            <ul className={ (isActiveCate && props.tags?.length > 0) ? 'px-[12px] pb-[12px]' : 'h-0 overflow-hidden' }>
                {props.tags?.map((tag, idx) => (
                    <li
                        key={ idx }
                        className={`overflow-hidden font-light text-[13px] transition-all duration-300 ${ isActiveCate ? 'max-h-[200px] mt-[6px]' : 'h-[0vh] p-0 m-0' }`}
                    >
                        <Link
                            to={{ pathname: '/memo', search: `${ props.to.search }&tag=${ tag.name }` }}
                            className={`flex w-full h-fit py-[8px] pl-[16px] rounded-[5px] mb-[1px] hover:bg-gray-300
                            ${ searchParams.get('tag') === tag.name && 'bg-gray-300' }`}
                        >
                            <TagIcon svgClassName='w-[14px] mr-[8px]' strokeClassName='fill-dark/90'/>
                            <p>{ tag.name }</p>
                        </Link>
                    </li>
                ))}
            </ul>
        </li>
    )
}