import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState, store} from '../../store';
import {deleteAlertReducer, IAlertObject} from '../../store/alert/alert.slice';
import {AlarmIcon} from './Icons';

export const Alert = () => {
    const alarmRef = useRef<HTMLDivElement>(null);

    const [alert, setAlert] = useState<IAlertObject>({ message: '' });
    const [isShow, setIsShow] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isRender, setIsRender] = useState(false);

    const dispatch = useDispatch();
    const alertState = useSelector((state:RootState) => state.alert);

    const showAlert = () => {
        // 초기에 보이지 않는 상태였기 때문에 실행시 display 재설정
        setIsRender(true);
        alarmRef.current.style.display = 'flex';

        // 동작중이 아니고, 알람이 들어오면
        if (!isRunning && store.getState().alert.alerts.length > 0) {
            setIsRunning(true);
            setAlert(store.getState().alert.alerts[store.getState().alert.alerts.length - 1]);
            setIsShow(true);

            // 팝업 알람이기 때문에 일정 시간 후 알람을 다시 숨김
            setTimeout(() => {
                setIsShow(false);

                // transition을 기다린 후 보이지않도록 display 재설정
                setTimeout(() => {
                    dispatch(deleteAlertReducer());
                    setIsRunning(false);
                    showAlert();
                    alarmRef.current.style.display = 'none';
                }, 300);

            }, 3000);
        }
    }

    useEffect(() => showAlert(), [alertState.alerts]);

    useEffect(() => {
        if (!isRunning && store.getState().alert.alerts.length === 0) {
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