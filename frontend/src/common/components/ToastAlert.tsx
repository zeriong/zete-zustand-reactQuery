import React, {useEffect, useRef, useState} from 'react';
import {AlarmIcon} from './Icons';
import {create} from 'zustand';

interface IAlertMessage { message: string }
interface IToastAlertStore {
    alerts: IAlertMessage[];
    setAlert: (message: string) => void;
    deleteAlert: () => void;
}

/** 토스트알림에 대한 상태관리 store */
export const useToastAlertStore = create<IToastAlertStore>() ((setState) => ({
    alerts: [],
    setAlert: (message: string) => setState((state) => ({ alerts: [...state.alerts, {message}] })),
    deleteAlert: () => setState((state) => {
        state.alerts.shift();
        return { alerts: [...state.alerts] }
    }),
}))

export const ToastAlert = () => {
    const alarmRef = useRef<HTMLDivElement>(null);

    const [alert, setAlert] = useState<IAlertMessage>({ message: '' });
    const [isShow, setIsShow] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isRender, setIsRender] = useState(false);

    const toastStore = useToastAlertStore();

    const showAlert = () => {
        // 초기에 보이지 않는 상태였기 때문에 실행시 display 재설정
        setIsRender(true);
        alarmRef.current.style.display = 'flex';

        // 동작중이 아니고, 알람이 들어오면 실행한다.
        // useToastAlertStore를 변수에 할당하지 않고 계속 풀어서 getState로 비교하는 이유는
        // setTimeout이 기다렸다 실행되는 시점의 개수를 비교해야하기 때문이다.
        // 변수에 할당한다면 이전 값을 참조하게되어 무한루프가 발생한다.
        if (!isRunning && useToastAlertStore.getState().alerts.length > 0) {
            setIsRunning(true);
            setAlert(useToastAlertStore.getState().alerts[useToastAlertStore.getState().alerts.length - 1]);
            setIsShow(true);

            // 팝업 알람이기 때문에 일정 시간 후 알람을 다시 숨김
            setTimeout(() => {
                setIsShow(false);

                // transition을 기다린 후 보이지않도록 display 재설정
                setTimeout(() => {// store
                    toastStore.deleteAlert();
                    setIsRunning(false);
                    showAlert();
                    alarmRef.current.style.display = 'none';
                }, 300);

            }, 3000);
        }
    }

    useEffect(() => showAlert(), [toastStore.alerts]);

    useEffect(() => {
        if (!isRunning && useToastAlertStore.getState().alerts.length === 0) {
            setIsRender(false);
        }
    }, [isRunning]);

    return (
        <>
            {!isRender ? <div ref={ alarmRef }/> :
                <div
                    ref={ alarmRef }
                    className={`bg-black/90 flex items-center justify-center fixed h-[40px] pl-[20px] pr-[26px] py-[30px] z-[200] left-[26px]
                    rounded-[4px] transition-all duration-300 ease-in-out ${ isShow ? 'bottom-[26px] opacity-100' : 'opacity-0 bottom-0' }`}
                >
                    <div className='mr-[6px]'>
                        <AlarmIcon className='fill-white h-[22px]'/>
                    </div>
                    <span className='w-full font-normal text-white'>
                        { alert.message }
                    </span>
                </div>
            }
        </>
    )
}