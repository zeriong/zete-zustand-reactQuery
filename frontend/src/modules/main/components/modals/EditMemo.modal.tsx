import React, {Fragment, useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../../store';
import {useForm} from 'react-hook-form';
import {Memo, UpdateMemoInput} from '../../../../openapi/generated';
import {useSearchParams} from 'react-router-dom';
import {Dialog, Transition} from '@headlessui/react';
import {CategoryIcon, CloseIcon, FillStarIcon, PlusIcon, StarIcon} from '../../../../common/components/Icons';
import {removeSpace} from '../../../../libs/common.lib';
import {showAlert} from '../../../../store/alert/alert.actions';
import {Api} from '../../../../openapi/api';
import {deleteMemoTag, addMemoTagSubmit, focusToContent, loadMemos} from '../../../../libs/memo.lib';
import {HorizontalScroll} from '../../../../common/components/HorizontalScroll';
import {updateMemoReducer} from '../../../../store/memo/memo.slice';
import {getCategoriesAction} from '../../../../store/memo/memo.actions';
import {AutoResizeInput} from '../../../../common/components/AutoResizeInput';

export const EditMemoModal = () => {
    const savedMemoRef = useRef<Memo | null>(null);
    const saveDelayTimerRef = useRef<NodeJS.Timeout | null>(null);
    const getDelayTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isSavingMemoRef = useRef(false);
    const isLoadingMemoRef = useRef(false);
    const requestMemoIdRef = useRef(0);

    const [searchParams, setSearchParams] = useSearchParams();
    const [isShow, setIsShow] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const memoState = useSelector((state:RootState) => state.memo);

    const form = useForm<UpdateMemoInput>({ mode: 'onSubmit' });

    // searchParams를 통한 메모수정 모달 컨트롤
    useEffect(() => {
        // 저장된 메모 클릭시 URL QueryParams가 view=memoId로 변경되기 때문에
        // requestMemoIdRef에 id를 저장하여 업데이트할 메모를 요청할 때 사용한다.
        requestMemoIdRef.current = Number(searchParams.get('view'));
        if (requestMemoIdRef.current) {
            form.reset();
            setIsShow(true);
            trySetModal();
        } else {
            setIsShow(false);
        }
    },[searchParams]);

    // 수정할 메모를 요청해서 받은 데이터를 기반으로 세팅
    const setModal = () => {
        (async () =>{
            // 메모를 받아오기 전까지 로딩상태를 유지하기 위함
            isLoadingMemoRef.current = true;

            const res = await Api.memo.getMemo({ id: requestMemoIdRef.current });
            if (res.data.success) {
                const memo = res.data.memo;
                // 인터넷환경이 좋지않아 지연로드 되는경우 잘못된 데이터가 세팅되는 것을 방지하기 위해
                // 위 useEffect에서 URL QueryParams로 받은 id와 getMemo를 통해 서버에서 받은
                // memo의 id가 일치하는 경우에만 폼을 해당 메모 내용으로 세팅해준다.
                if (requestMemoIdRef.current === Number(res.data.memo.id)) {
                    savedMemoRef.current = memo;
                    form.setValue('title', memo.title || '');
                    form.setValue('content', memo.content || '');
                    form.setValue('cateId', Number(memo.cateId));
                    form.setValue('tags', memo.tags);
                    form.setValue('isImportant', memo.isImportant);
                }
            } else {
                showAlert('존재하지 않는 메모입니다.');
                searchParams.delete('view');
                setSearchParams(searchParams);
                loadMemos(true);
                dispatch(getCategoriesAction());
            }
            isLoadingMemoRef.current = false;
        })()
    }

    // 메모 수정 (auto 인자는 해당 함수를 자동저장인지 직접저장인지를 식별하는 용도)
    const updateMemo = async (auto?) => {
        clearTimeout(saveDelayTimerRef.current);
        saveDelayTimerRef.current = null;
        isSavingMemoRef.current = true;

        const data = form.getValues();
        const targetMemo = memoState.memo.list.find(memo => memo.id === requestMemoIdRef.current);
        const diffTagLength = data.tags?.length === 0 ? 0 : targetMemo.tags.filter(tag => data.tags.some(formTag => formTag.name === tag.name)).length;

        // 폼에 내부에 내용이 존재하지 않고 store에 저장된 메모의 내용들과
        // useForm의 내용들을 비교하여 변경사항이 없다면 업데이트를 요청하지 않는다.
        if (removeSpace(data.title).length === 0 && removeSpace(data.content).length === 0) {
            // auto 인자를 전달받아 auto(자동저장인 경우)가 있는 경우라면 팝업알람을 띄우지 않지만
            // 직접 배경을 눌러 update를 요청한 경우라면 팝업 알람을 띄워준다.
            if (auto) return;
            return showAlert('입력내용이 존재하지 않아 마지막 내용을 저장합니다.');
        }
        if (data.title === targetMemo.title && data.content === targetMemo.content && data.cateId === Number(targetMemo.cateId) &&
            targetMemo.tags?.length === diffTagLength && targetMemo.isImportant === data.isImportant) return;

        // 변경사항이 존재하고 폼에 내용이 존재한다면 수정된 내용을 저장할 수 있도록 요청
        try {
            const res = await Api.memo.updateMemo({ ...data, id: savedMemoRef.current.id });
            if (res.data.success) savedMemoRef.current = res.data.savedMemo;
            else showAlert(res.data.error);
        } catch (e) {
            showAlert('메모 수정에 실패하였습니다.');
            loadMemos(true);
        }

        // 메모수정에 필요한 모든 작업이 끝난 후 사이드 네비게이션에 내용도 최신화된 데이터로 갱신시켜 주고
        // 저장 진행상태를 가지고 있던 isSavingMemoRef.current를 false로 변경하여
        // tryUpdateMemo에서 updateMemo함수를 실행 가능하도록 만들어준다.
        dispatch(getCategoriesAction());
        isSavingMemoRef.current = false;
    }

    // 모달 세팅 시도
    const trySetModal = () => {
        (async () => {
            // getDelayTimerRef의 타임아웃이 진행중이라면 취소
            if (getDelayTimerRef.current != null) {
                clearTimeout(getDelayTimerRef.current);
                getDelayTimerRef.current = null;
            }
            if (getDelayTimerRef.current == null) {
                // 데이터로드중이라면 연기 (메모수정이 완료 되지 않아도 세팅 연기)
                if (isLoadingMemoRef.current) {
                    getDelayTimerRef.current = setTimeout(() => {
                        trySetModal();
                    }, 500);
                } else { // 모달 세팅
                    await setModal();
                }
            }
        })()
    }

    // 메모 수정 시도
    const tryUpdateMemo = () => {
        // saveDelayTimerRef의 타임아웃이 진행중이라면 취소
        if (saveDelayTimerRef.current != null) {
            clearTimeout(saveDelayTimerRef.current);
            saveDelayTimerRef.current = null;
        }
        // 메모 수정중인 상태라면 연기
        if (saveDelayTimerRef.current == null) {
            saveDelayTimerRef.current = setTimeout(async () => {
                if (isSavingMemoRef.current) tryUpdateMemo();  // 저장중이라면 연기
                else await updateMemo(true);  // 저장
            }, 3000);
        }
    }

    const closeModal = async () => {
        searchParams.delete('view');
        setSearchParams(searchParams);
        if (savedMemoRef.current) {
            await updateMemo();
            dispatch(updateMemoReducer(savedMemoRef.current));
        }
        form.reset();
        savedMemoRef.current = null;
    }

    // 폼 입력 감지하여 메모 업데이트
    useEffect(() => {
        const subscription = form.watch((data, { name, type }) => {
            // 특정 항목이 입력될 경우
            if (name) tryUpdateMemo();
        });
        return () => subscription.unsubscribe();
    }, [form.watch]);

    return (
        <Transition appear show={ isShow } as={ Fragment }>
            <Dialog
                as='div'
                className='relative z-40'
                onClose={ closeModal }
            >
                <Transition.Child
                    as={ Fragment }
                    enter='ease-out duration-300'
                    enterFrom='opacity-0'
                    enterTo='opacity-100'
                    leave='ease-in duration-200'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                >
                    <div className='fixed inset-0 bg-black bg-opacity-40' />
                </Transition.Child>
                <div className='fixed inset-0 overflow-y-auto'>
                    <div className='flex min-h-full items-center justify-center p-[16px]'>
                        <Transition.Child
                            as={ Fragment }
                            enter='ease-out duration-300'
                            enterFrom='opacity-0 scale-95'
                            enterTo='opacity-100 scale-100'
                            leave='ease-in duration-200'
                            leaveFrom='opacity-100 scale-100'
                            leaveTo='opacity-0 scale-95'
                        >
                            <Dialog.Panel className='relative transform overflow-hidden bg-white text-left shadow-xl rounded-[5px]'>
                                <article
                                    className='relative min-w-0 w-[300px] md:w-[400px] flex flex-col justify-between
                                    border border-gray-300 rounded-[8px] px-[18px] pb-[10px] pt-[12px] min-h-[212px] h-fit bg-memo memo-shadow'
                                >
                                    {(isLoadingMemoRef.current || !savedMemoRef.current) &&  // 응답을 받는중이거나 모달이 닫히는경우 form을 숨겨줌
                                        <div className='absolute left-0 top-0 w-full h-full bg-memo z-10 rounded-[5px]'/>
                                    }
                                    <div className='w-full h-full flex flex-col min-h-[212px]'>

                                        <form onSubmit={ focusToContent } className='w-full h-full'>
                                            <div className='flex justify-between items-center pb-[8px] border-b border-gray-300/90 h-full'>
                                                <input
                                                    {...form.register('title', {
                                                        required: false,
                                                        maxLength: 255,
                                                    })}
                                                    tabIndex={ 1 }
                                                    placeholder='제목'
                                                    className='resize-none w-full pr-[6px] max-h-[80px] bg-transparent text-gray-500 placeholder:text-gray-500
                                                    font-light placeholder:text-[15px] memo-custom-scroll'
                                                />
                                                <button
                                                    type='button'
                                                    onClick={ () => form.setValue('isImportant', !form.getValues('isImportant')) }
                                                >
                                                    { form.watch('isImportant') ? <FillStarIcon/> : <StarIcon/> }
                                                </button>
                                            </div>
                                            <div className='relative h-full w-full pt-[9px]'>
                                                {isLoadingMemoRef.current &&
                                                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20px] whitespace-nowrap font-bold text-gray-500/80 z-20'>
                                                        메모를 불러오는 중입니다.
                                                    </div>
                                                }
                                                <textarea
                                                    {...form.register('content', {
                                                        required: false,
                                                        maxLength: 65535,
                                                    })}
                                                    rows={ 1 }
                                                    placeholder='메모 작성...'
                                                    className='resize-none h-[280px] w-full bg-transparent text-gray-500 placeholder:text-gray-500
                                                    font-light placeholder:text-[15px] memo-custom-scroll'
                                                />
                                            </div>
                                        </form>
                                        <div className='w-full'>
                                            <HorizontalScroll>
                                                <div className='flex w-full h-full relative pb-[8px] overflow-y-hidden'>
                                                    {form.watch('tags')?.map((tag, idx) => (
                                                        <div key={ idx } className='relative flex items-center pl-[9px] pr-[21px] py-[1px] mr-[4px] rounded-[4px] bg-black/10 cursor-default'>
                                                            <span className='font-light text-[11px] text-dark/90 whitespace-nowrap'>
                                                                { tag.name }
                                                            </span>
                                                            <button
                                                                type='button'
                                                                onClick={ () => deleteMemoTag(form, tag.name) }
                                                                className='absolute right-[2px] group rounded-full grid place-content-center hover:bg-dark/40 w-[14px] h-[14px]'
                                                            >
                                                                <CloseIcon className='w-[10px] fill-dark/90 group-hover:fill-white'/>
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <form
                                                        onSubmit={(event) => {
                                                            addMemoTagSubmit(event, form);
                                                            event.target[0].style.width = '50px'; // 인풋 width 초기화
                                                        }}
                                                        className='relative flex items-center text-dark/90 text-[12px]'
                                                    >
                                                        <AutoResizeInput
                                                            placeholder='태그추가'
                                                            className='min-w-[50px] w-[50px] px-[2px] placeholder:text-gray-500/95 bg-transparent whitespace-nowrap'
                                                        />
                                                        <button type='submit' className='relative w-[14px] h-[14px] grid place-content-center'>
                                                            <PlusIcon svgClassName='w-[9px]' strokeClassName='fill-black'/>
                                                        </button>
                                                    </form>
                                                </div>
                                            </HorizontalScroll>
                                            <div className='flex justify-between items-center pt-[10px] border-t border-gray-300/90'>
                                                <div className='flex items-center border border-gray-300/90 rounded-md px-[8px] py-[4px]'>
                                                    <CategoryIcon className='w-[18px] opacity-75 mr-[2px]'/>
                                                    <select
                                                        { ...form.register('cateId', { required: true }) }
                                                        className='w-[130px] text-[13px] text-gray-500 bg-transparent'
                                                    >
                                                        <option value={0}>
                                                            전체메모
                                                        </option>
                                                        {memoState.cate.list.map((cate, idx) => (
                                                            <option key={ idx } value={ cate.id }>
                                                                { cate.name }
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}