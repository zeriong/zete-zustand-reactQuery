import React, {useEffect, useRef, useState} from 'react';
import {UseFormReturn} from 'react-hook-form';
import {showAlert} from '../../../store/alert/alert.actions';
import {Api} from '../../../openapi/api';
import CustomScroller from '../../../common/components/customScroller';
import axios from 'axios';
import {AutoResizeTextarea} from '../../../common/components/AutoResizeTextarea';

export const AskAI = (props: { isShow: boolean, memoForm: UseFormReturn<any> }) => {
    const requestRef = useRef(null);

    const [usableCount, setUsableCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isWaiting, setIsWaiting] = useState(false);
    const [message, setMessage] = useState('');
    const [inputValue, setInputValue] = useState('');

    const askAiSubmit = (event) => {
        event.preventDefault();

        if (usableCount <= 0) return showAlert('질문가능 횟수가 초과하였습니다, 매일 자정이 지나면 충전됩니다.');

        if (!inputValue || inputValue.length < 2) return showAlert('질문을 입력해 주시기 바랍니다.');

        requestRef.current = axios.CancelToken.source();
        setIsLoading(true);
        Api.openAi.createCompletion({ content: inputValue }, { cancelToken: requestRef.current.token })
            .then((res) => {
                if (res.data?.success) {
                    // 사용자경험을 향상을 위해 요청을 받은 후 대기 시간동안 '답변이 거의 완성되었어요!' 문구를 띄움
                    setIsWaiting(true);

                    // gpt 3.5 turbo 무료 크레딧 특성상 요청이 매우느리고 연속요청에 에러를 발생시키기 때문에 요청에러방지,
                    setTimeout(() => {
                        setIsWaiting(false);
                        setIsLoading(false);
                    }, 5000);

                    if (res.data.gptResponse) {
                        setUsableCount(res.data.usableCount);
                        setMessage(res.data.gptResponse);
                    }
                } else if (res.data?.error) {
                    showAlert(res.data.error);
                    setIsLoading(false);
                }
            })
            .catch(() => {
                showAlert('GPT 답변 요청이 취소되었습니다.');
                setIsLoading(false);
            });
        setInputValue('');
    }

    useEffect(() => {
        if (props.isShow) {
            // ai 질문 모드로 전환시 질문 가능 횟수 로드
            Api.user.getGptUsableCount().then((res) => {
                if (res.data?.success) setUsableCount(res.data.count);
            });
        } else {
            // 초기화
            if (requestRef.current) requestRef.current.cancel();

            // 응답받고 추가대기시간때도 알림을 띄움 (유저입장에선 똑같이 기다리는 상황이기 때문)
            if (isWaiting) showAlert('GPT 답변 요청이 취소되었습니다.');
            setUsableCount(0);
            setIsLoading(false);
            setIsWaiting(false);
            setMessage('');
            setInputValue('');
        }
    }, [props.isShow]);

    return (
        <section
            className={`flex flex-col transition-all duration-300 w-full bg-gpt/50 h-0 rounded-b-[8px] overflow-hidden z-50 shadow-2xl
                ${ props.isShow && ' h-[400px] p-[10px]' }`}
        >
            <div className='flex flex-col w-full h-full'>
                <div className='relative flex flex-col grow text-start text-dark bg-white/80 rounded-[8px] p-[8px]'>
                    <div className='relative text-center bg-gpt rounded-[8px] py-[4px]'>
                        <h1 className='text-[14px] md:text-[16px] text-black/90 font-bold'>
                            Chat GPT
                        </h1>
                        <h2 className='absolute top-1/2 -translate-y-1/2 text-[10px] md:text-[13px] right-[10px] md:right-[13px] text-white'>
                            질문 가능 횟수: <span>{ usableCount }</span>
                        </h2>
                    </div>
                    <div className='grow relative px-[8px] flex items-center w-full'>
                        {isLoading ? (
                            <div className='flex items-center justify-center w-full h-full text-center'>
                                {isWaiting ?
                                    <h1 className='text-[20px] font-bold'>
                                        답변이 거의 완성되었어요!
                                    </h1>
                                    :
                                    <div className='text-[20px] font-bold'>
                                        gpt가 답변을 준비하고 있어요!
                                        <p className='text-[17px] text-black/70'>
                                            다소 시간이 걸릴 수 있습니다.
                                        </p>
                                    </div>
                                }
                            </div>
                        ) : (
                            <>
                                {message ? (
                                    <textarea
                                        readOnly={ true }
                                        value={ message }
                                        rows={ 1 }
                                        className='grow resize-none w-full !h-full pb-[46px] bg-transparent memo-custom-scroll overflow-auto'
                                    />
                                ) : (
                                    <div className='grid gap-[10px] w-full'>
                                        <h1 className='text-[16px] md:text-[18px] text-center font-bold '>
                                            궁금한 것이 있다면 GPT에게 물어보세요!
                                        </h1>
                                        <ol className='list-disc pl-[16px] mb-[2px] md:mb-[8px] font-medium text-[12px] md:text-[14px]'>
                                            <li>
                                                표준어를 사용해주세요!<br/>
                                                줄임말이나 신조어를 사용하면 원하는 답변을 <br className='block md:hidden'/>
                                                받지 못할 수 있어요.
                                            </li>
                                        </ol>
                                        <h2 className='font-bold text-[13px] md:text-[15px]'>※ 참고사항</h2>
                                        <ol className='list-decimal pl-[16px] font-medium text-[12px] md:text-[14px] grid gap-[6px] md:gap-[10px] leading-4'>
                                            <li>
                                                GPT에게 질문 가능한 횟수는 계정당 하루에 <br className='xs:hidden'/><span className='bg-gpt/50 pl-[2px] pr-[3px]'>10회</span>가능합니다.
                                            </li>
                                            <li>
                                                이전 대화에 이어서 <span className='bg-gpt/50 pl-[2px] pr-[3px]'>대화는 불가능</span>
                                                하며 하나의 질문에만<br className='hidden xs:block'/> 답변만 할 수 있어요.
                                            </li>
                                            <li>
                                                GPT에게 질문 하고 답변을 기다리는 도중 메모창이<br className='block md:hidden'/> 닫히거나<br className='hidden md:block'/>
                                                Chat GPT 창이 닫히면 횟수만 차감되고<br className='block md:hidden'/> 답변을 받을 수 없습니다.
                                            </li>
                                        </ol>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    {!isLoading && message && (
                        <button
                            type='button'
                            onClick={() => {
                                const form = props.memoForm;
                                const content = form.getValues('content');
                                if (content === '') form.setValue('content', message);
                                else form.setValue('content', content + '\n' + message);
                            }}
                            className='absolute bottom-[12px] left-1/2 -translate-x-1/2 transition-all duration-300 bg-gpt py-[4px] px-[8px] rounded-[8px] text-gray-100 z-50'
                        >
                            메모에 추가하기 +
                        </button>
                    )}
                </div>
                <form
                    onSubmit={ askAiSubmit }
                    className={`relative shrink flex items-center justify-between p-[5px_0px_5px_12px] shadow-1xl rounded-[12px] mt-[10px]
                    border border-gray-300 shadow-2xl ${ isLoading ? 'bg-gray-200' : 'bg-white' }`}
                >
                    <div className='flex items-center w-full'>
                        <CustomScroller autoHeight={ true } autoHeightMax={ 88 } customTrackVerticalStyle={{ width: 6 }}>
                            <AutoResizeTextarea
                                value={ inputValue }
                                maxLength={ 500 }
                                rows={ 1 }
                                disabled={ isLoading }
                                placeholder='GPT에게 물어보세요! ( Shift + Enter 줄바꿈 )'
                                className='flex resize-none bg-transparent placeholder:text-gray-500 font-light placeholder:text-[14px] w-full h-fit'
                                onChange={(event) =>  setInputValue(event.target.value)}
                                onKeyDown={(event) => {
                                    // shift + Enter = 줄바꿈, Enter = submit
                                    if (event.key === 'Enter' && !event.shiftKey) askAiSubmit(event);
                                }}
                            />
                        </CustomScroller>
                    </div>
                    <button
                        type='submit'
                        disabled={ isLoading }
                        className={`right-[12px] mx-[10px] px-[8px] whitespace-nowrap h-fit text-[15px] rounded
                        ${ isLoading ? 'text-white/80 bg-gpt/50' : 'text-white bg-gpt/80' }`}
                    >
                        전송
                    </button>
                </form>
            </div>
        </section>
    )
}