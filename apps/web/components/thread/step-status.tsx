import { Block } from '@/libs/store/chat.store';
import { IconCircleCheckFilled, IconCircleDashed, IconCircleDashedX } from '@tabler/icons-react';

export const StepStatus = ({ status }: { status: Block['nodeStatus'] }) => {
  switch (status) {
    case 'pending':
      return <SpinnerIcon size={16} className="text-tertiary size-4 shrink-0 animate-spin" />;
    case 'completed':
      return <IconCircleCheckFilled className="text-brand size-4 shrink-0" />;
    case 'error':
      return <IconCircleDashedX className="text-tertiary size-4 shrink-0" />;
    default:
      return <IconCircleDashed className="text-tertiary size-4 shrink-0" strokeWidth={1} />;
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
      <g fill="none" fillRule="evenodd" strokeWidth="2">
        <circle cx="22" cy="22" r="2" strokeWidth={2}>
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
        <circle cx="22" cy="22" r="2" strokeWidth={2}>
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
