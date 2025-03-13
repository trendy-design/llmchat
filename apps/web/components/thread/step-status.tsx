import { ItemStatus } from '@/libs/store/chat.store';
import { IconCircleCheckFilled, IconCircleDashed, IconCircleDashedX } from '@tabler/icons-react';

export const StepStatus = ({ status }: { status: ItemStatus }) => {
  switch (status) {
    case 'PENDING':
      return <SpinnerIcon size={16} className="text-brand size-4 shrink-0 animate-spin" />;
    case 'COMPLETED':
      return <IconCircleCheckFilled className="text-brand size-4 shrink-0" />;
    case 'ERROR':
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