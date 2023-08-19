import React, {useRef, useEffect, TextareaHTMLAttributes, useImperativeHandle} from 'react';

export const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
    (props, ref) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);

        // 최종 타겟 ref를 inputRef로 지정
        useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

        const resizeTextarea = () => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${ textareaRef.current.scrollHeight }px`;
            }
        }

        // useForm 등으로 인한 내용 변화 감지 용도
        useEffect(() => {
            resizeTextarea();
        }, [props.value, props.className]);

        useEffect(() => {
            resizeTextarea();
        }, []);

        return (
            <textarea
                { ...props }
                ref={ textareaRef }
                onInput={() => {
                    // 직접적인 입력 감지
                    resizeTextarea();
                }}
            />
        )
    }
);