import {CategoryIcon, CloseIcon, FillStarIcon, PlusIcon, StarIcon} from '../../../common/components/Icons';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch, RootState} from '../../../store';
import {Controller, useForm} from 'react-hook-form';
import {showAlert} from '../../../store/alert/alert.actions';
import {CreateMemoInput, Memo} from '../../../openapi/generated';
import {removeSpace} from '../../../libs/common.lib';
import {useSearchParams} from 'react-router-dom';
import {deleteMemoTag, getCategoryId, addMemoTagSubmit, focusToContent} from '../../../libs/memo.lib';
import {useOutsideClick} from '../../../hooks/useOutsideClick';
import {AskAI} from './AskAI';
import {HorizontalScroll} from '../../../common/components/HorizontalScroll';
import {Api} from '../../../openapi/api';
import {saveMemoReducer} from '../../../store/memo/memo.slice';
import {getCategoriesAction} from '../../../store/memo/memo.actions';
import {AutoResizeTextarea} from '../../../common/components/AutoResizeTextarea';
import {AutoResizeInput} from '../../../common/components/AutoResizeInput';

export const AddMemo = () => {
    const panelRef = useRef<HTMLDivElement>(null);
    const savedMemoRef = useRef<Memo | null>(null);
    const saveDelayTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isSavingMemoRef = useRef(false);
    const isCancelMemoRef = useRef(false);

    const [searchParams] = useSearchParams();
    const [formMode, setFormMode] = useState<'idle' | 'edit' | 'askAI'>('idle');

    const dispatch = useDispatch<AppDispatch>();
    const memoState = useSelector((state: RootState) => state.memo);

    const form = useForm<CreateMemoInput>({ mode: 'onSubmit' });

    // 초기화
    const resetForm = () => {
        form.reset({
            title: '',
            content: '',
            isImportant: false,
            tags: [],
            cateId: getCategoryId(searchParams),
        })
    }

    // 메모 저장
    const saveMemo = async () => {
        const data = form.getValues();
        isSavingMemoRef.current = true;
        // 신규입력
        if (!savedMemoRef.current) {
            // 입력된 내용이 있다면 생성
            if (removeSpace(data?.title).length > 0 || removeSpace(data?.content).length > 0) {
                try {
                    const res = await Api.memo.createMemo(data);
                    if (res.data.success) savedMemoRef.current = res.data.savedMemo;
                    else showAlert(res.data.error);
                } catch (e) {
                    showAlert('메모 저장에 실패하였습니다.');
                }
            }
        } else {
            // 내용이 있는 경우 저장
            if (removeSpace(data?.title)?.length > 0 || removeSpace(data?.content).length > 0) {
                try {
                    const res = await Api.memo.updateMemo({ ...data, id: savedMemoRef.current.id });
                    if (res.data.success) savedMemoRef.current = res.data.savedMemo;
                    else showAlert(res.data.error);
                } catch (e) {
                    showAlert('메모 저장에 실패하였습니다.');
                }
            } else {
                // 저장된 아이디가 존재하지만 내용이 비워진 경우 삭제
                try {
                    const res = await Api.memo.deleteMemo({id: savedMemoRef.current.id});
                    if (res.data.success) savedMemoRef.current = null;
                    else showAlert('삭제된 메모입니다.');
                } catch (e) {
                    console.log('메모 삭제 실패, 실패사유: ',e);
                }
            }
        }
        isSavingMemoRef.current = false;
    }

    // 메모 저장 시도
    const trySaveMemo = () => {
        if (saveDelayTimerRef.current != null) {
            clearTimeout(saveDelayTimerRef.current);
            saveDelayTimerRef.current = null;
        }
        // 내용이 있는경우 idle일때 저장하기 때문에 3초로 통신주기를 줄임
        if (saveDelayTimerRef.current == null) {
            saveDelayTimerRef.current = setTimeout( async () => {
                if (isSavingMemoRef.current) trySaveMemo();  // 저장중이라면 연기
                else await saveMemo();  // 저장
            }, 3000);
        }
    }

    // 메모작성 취소
    const cancelAddMemo = async () => {
        isCancelMemoRef.current = true;
        if (savedMemoRef.current) {
            try {
                const res = await Api.memo.deleteMemo({id: savedMemoRef.current.id});
                if (res.data.success) savedMemoRef.current = null;
                else showAlert('삭제된 메모입니다.');
            } catch (e) {
                console.log('메모 삭제 실패, 실패사유: ',e);
            }
        }
        resetForm();
        setFormMode('idle');
    }

    // 입력폼 이외 영역 클릭 감지
    useOutsideClick(panelRef, () => setFormMode('idle'));

    // 폼 입력 감지
    useEffect(() => {
        const subscription = form.watch((data, { name, type }) => {
            // 특정 항목이 입력될 경우
            if (name) trySaveMemo();
        });
        return () => subscription.unsubscribe();
    }, [form.watch]);

    useEffect(() => {
        // 대기 모드로 변경시 폼 초기화
        if (formMode === 'idle') {

            (async () => {
                const data = form.getValues();

                // idle일때 timeout 삭제하여 이중통신 방지
                clearTimeout(saveDelayTimerRef.current);
                saveDelayTimerRef.current = null;

                // 메모 내용이 존재하는경우 메모 즉시 저장요청
                if (removeSpace(data.title)?.length > 0 || removeSpace(data.content)?.length > 0) {
                    await saveMemo();

                    // 생성한 메모 카테고리가 현재 카테고리와 같거나 전체메모인 경우만 메모 렌더링
                    if (Number(searchParams.get('cate')) === data.cateId || !searchParams.get('cate')) {
                        dispatch(saveMemoReducer(savedMemoRef.current));
                    }

                    // 카테고리 최신화, 임시저장된 메모 삭제
                    dispatch(await getCategoriesAction());
                    savedMemoRef.current = null;
                }
            })()

            // 메모취소를 누른 것이 아니라면 폼 리셋
            if (!isCancelMemoRef.current) resetForm();
            else isCancelMemoRef.current = false;
        }
    }, [formMode]);

    useEffect(() => {
        // url 변경시 변경된 카테고리 아이디 지정
        form.setValue('cateId', getCategoryId(searchParams));
        setFormMode('idle');
    }, [searchParams]);

    return (
        <>
            <div
                onTouchStart={ (e) => e.stopPropagation() }
                className={`block md:hidden fixed w-full top-[91px] left-0 z-[25] bg-gradient-to-b
                ${formMode === 'edit' || formMode === 'askAI' ? 'h-full backdrop-blur' : 'h-[90px] backdrop-blur-sm'}`}
            />
            <article
                ref={ panelRef }
                id='add_memo_panel'
                className='fixed md:relative w-[calc(100%-32px)] md:w-full max-w-[500px] z-[25] top-[109px] md:top-0'
            >
                <section
                    className={`flex flex-col transition-all duration-300 px-[18px] pb-[10px] pt-[12px]
                    ${formMode === 'askAI' ? 'rounded-t-[8px] bg-white border-t-[10px] border-x-[10px] border-gpt/50'
                    : 'border border-gray-300/80 rounded-[8px] bg-memo memo-shadow'}`}
                >
                    <form onSubmit={ focusToContent } className='w-full'>
                        {formMode !== 'idle' && (
                            <div className='flex justify-between items-center overflow-hidden pb-[16px]'>
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
                        )}
                        <div className='flex items-center'>
                            <Controller
                                name='content'
                                control={ form.control }
                                rules={{ required: false, maxLength: 65535 }}
                                render={({ field: { value, onChange } }) => (
                                    <AutoResizeTextarea
                                        value={ value }
                                        onChange={ onChange }
                                        onFocus={() => {
                                            // 대기 상태라면 입력 모드로 전환
                                            if (formMode === 'idle') setFormMode('edit');
                                        }}
                                        tabIndex={ 2 }
                                        rows={ 1 }
                                        placeholder='메모 작성...'
                                        className={`resize-none max-h-[300px] w-full bg-transparent text-gray-500 placeholder:text-gray-500
                                        font-light placeholder:text-[15px] memo-custom-scroll ${ formMode === 'idle' ? '!h-[24px]' : 'pb-[26px]' }`}
                                    />
                                )}
                            />
                            {formMode === 'idle' && (
                                <>
                                    <button
                                        type='button'
                                        className={`hidden md:block w-[130px] text-[12px] rounded-[8px] font-normal text-white border-2 border-gpt/30 bg-gpt py-[4px] px-[8px]`}
                                        onMouseUp={ () => setFormMode('askAI') }
                                        onTouchStart={ () => setFormMode('askAI') }
                                    >
                                        AI에게 질문하기
                                    </button>
                                    <button
                                        type='button'
                                        className={`block md:hidden text-[12px] rounded-[8px] font-normal text-white border-2 border-gpt/80 bg-gpt py-[4px] px-[8px] whitespace-nowrap`}
                                        onClick={ () => setFormMode('askAI') }
                                    >
                                        GPT
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                    {formMode !== 'idle' && (
                        <div className='w-full'>
                            <HorizontalScroll>
                                <div className='flex w-full h-full relative pt-[8px] pb-[9px] overflow-y-hidden'>
                                    {form.watch('tags')?.map((tag, idx) => (
                                        <div key={ idx } className='relative flex items-center pl-[9px] pr-[21px] py-[1px] mr-[4px] rounded-[4px] bg-black/10 cursor-default'>
                                            <span className='font-light text-[11px] text-dark/90 whitespace-nowrap'>
                                                { tag.name }
                                            </span>
                                            <button
                                                onClick={ () => deleteMemoTag(form, tag.name) }
                                                className='absolute right-[2px] group rounded-full grid place-content-center hover:bg-dark/40 w-[14px] h-[14px]'
                                            >
                                                <CloseIcon className='w-[10px] fill-dark/90 group-hover:fill-white'/>
                                            </button>
                                        </div>
                                    ))}
                                    <form
                                        onSubmit={ (event) => {
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
                            <div className='relative flex justify-between items-center pt-[10px]'>
                                <div className='flex items-center'>
                                    <div className='flex items-center border border-gray-300/90 rounded-md px-[8px] py-[4px]'>
                                        <CategoryIcon className='w-[18px] opacity-75 mr-0.5'/>
                                        <select
                                            { ...form.register('cateId', { required: true }) }
                                            className='w-[130px] text-[13px] text-gray-500 bg-transparent'
                                        >
                                            <option value={ 0 }>
                                                전체메모
                                            </option>
                                            {memoState.cate.list.map((cate, idx) => (
                                                <option key={ idx } value={ cate.id }>
                                                    { cate.name }
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <>
                                        <button
                                            type='button'
                                            className={`hidden md:block text-[12px] rounded-[8px] font-normal text-white border-2 border-gpt/40 py-[4px] px-[8px] ml-[20px]
                                            ${ formMode === 'askAI' ? 'bg-gpt/40' : 'bg-gpt' }`}
                                            onClick={ () => setFormMode(formMode === 'askAI' ? 'edit' : 'askAI') }
                                        >
                                            AI에게 질문하기
                                        </button>
                                    </>

                                </div>
                                <button
                                    type='button'
                                    onClick={ cancelAddMemo }
                                    className='text-black/50 font-normal'
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    )}
                </section>
                <AskAI isShow={ formMode === 'askAI' } memoForm={ form }/>
            </article>
        </>
    )
}