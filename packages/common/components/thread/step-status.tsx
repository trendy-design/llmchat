import { ItemStatus } from '@repo/shared/types';
import { motion } from 'framer-motion';

export const StepStatus = ({ status }: { status: ItemStatus }) => {
    switch (status) {
        case 'PENDING':
            return (
                <span className="relative flex size-3 items-center justify-center">
                    <span className="bg-brand/50 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                    <span className="bg-brand relative inline-flex size-1 rounded-full"></span>
                </span>
            );
        case 'COMPLETED':
            return (
                <span className="relative flex size-3 items-center justify-center">
                    <span className="relative flex size-1">
                        <span className="bg-brand relative inline-flex size-1 rounded-full"></span>
                    </span>
                </span>
            );
        case 'ERROR':
            return (
                <span className="relative flex size-3 items-center justify-center">
                    <span className="relative flex size-1">
                        <span className="relative inline-flex size-1 rounded-full bg-rose-400"></span>
                    </span>
                </span>
            );
        default:
            return (
                <span className="relative flex size-3 items-center justify-center">
                    <span className="relative flex size-1">
                        <span className="bg-tertiary relative inline-flex size-1 rounded-full"></span>
                    </span>
                </span>
            );
    }
};

export const SpinnerIcon = ({ size = 24, ...props }: { size?: number; className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 44 44"
            stroke="currentColor"
            {...props}
        >
            <title>Loading...</title>
            <g fill="none" fillRule="evenodd" strokeWidth="3">
                <circle cx="22" cy="22" r="3" strokeWidth={3}>
                    <animate
                        attributeName="r"
                        begin="0s"
                        dur="1.8s"
                        values="1; 20"
                        calcMode="spline"
                        keyTimes="0; 1"
                        keySplines="0.165, 0.84, 0.44, 1"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="stroke-opacity"
                        begin="0s"
                        dur="1.8s"
                        values="1; 0"
                        calcMode="spline"
                        keyTimes="0; 1"
                        keySplines="0.3, 0.61, 0.355, 1"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle cx="22" cy="22" r="3" strokeWidth={3}>
                    <animate
                        attributeName="r"
                        begin="-0.9s"
                        dur="1.8s"
                        values="1; 20"
                        calcMode="spline"
                        keyTimes="0; 1"
                        keySplines="0.165, 0.84, 0.44, 1"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="stroke-opacity"
                        begin="-0.9s"
                        dur="1.8s"
                        values="1; 0"
                        calcMode="spline"
                        keyTimes="0; 1"
                        keySplines="0.3, 0.61, 0.355, 1"
                        repeatCount="indefinite"
                    />
                </circle>
            </g>
        </svg>
    );
};

export const DotSpinner = ({ size = 24, ...props }: { size?: number; className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            {...props}
        >
            <rect x="5" y="11" width="3" height="3" rx="1.5" ry="1.5" fill="currentColor">
                <animate
                    id="stretch1"
                    begin="0;stretch3.end+0.25s"
                    attributeName="height"
                    dur="0.6s"
                    values="3;8;3"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                    calcMode="spline"
                />
                <animate
                    begin="0;stretch3.end+0.25s"
                    attributeName="y"
                    dur="0.6s"
                    values="11;8;11"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                    calcMode="spline"
                />
            </rect>
            <rect x="11" y="11" width="3" height="3" rx="1.5" ry="1.5" fill="currentColor">
                <animate
                    begin="stretch1.begin+0.1s"
                    attributeName="height"
                    dur="0.6s"
                    values="3;8;3"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                    calcMode="spline"
                />
                <animate
                    begin="stretch1.begin+0.1s"
                    attributeName="y"
                    dur="0.6s"
                    values="11;8;11"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                    calcMode="spline"
                />
            </rect>
            <rect x="17" y="11" width="3" height="3" rx="1.5" ry="1.5" fill="currentColor">
                <animate
                    id="stretch3"
                    begin="stretch1.begin+0.2s"
                    attributeName="height"
                    dur="0.6s"
                    values="3;8;3"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                    calcMode="spline"
                />
                <animate
                    begin="stretch1.begin+0.2s"
                    attributeName="y"
                    dur="0.6s"
                    values="11;8;11"
                    keySplines=".33,.66,.66,1;.33,0,.66,.33"
                    calcMode="spline"
                />
            </rect>
        </svg>
    );
};

const loadingContainer = {
    width: '1.2rem',
    height: '1.2rem',
    display: 'flex',
    alignItems: 'center',
};

const loadingCircle = {
    display: 'block',
    width: '0.2rem',
    height: '0.2rem',
    overflow: 'hidden',
    marginLeft: '0.1rem',
    marginRight: '0.1rem',
    backgroundColor: 'currentColor',
    borderRadius: '30%',
};

export const ThreeDotsWave = () => {
    return (
        <div style={loadingContainer}>
            <motion.span
                style={loadingCircle}
                className="shrink-0"
                animate={{ y: [0, -4, 0] }}
                transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 0.8,
                    ease: 'easeInOut',
                }}
            />
            <motion.span
                style={loadingCircle}
                className="shrink-0"
                animate={{ y: [0, -4, 0] }}
                transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 0.8,
                    ease: 'easeInOut',
                    delay: 0.2,
                }}
            />
            <motion.span
                style={loadingCircle}
                className="shrink-0"
                animate={{ y: [0, -4, 0] }}
                transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 0.8,
                    ease: 'easeInOut',
                    delay: 0.4,
                }}
            />
        </div>
    );
};
