import { cn } from "../utils"

type IconProps = React.ComponentProps<"svg">

export const Icons = {
   notebook: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-5 md:size-4.5", className)}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M8 4H7.2002C6.08009 4 5.51962 4 5.0918 4.21799C4.71547 4.40973 4.40973 4.71547 4.21799 5.0918C4 5.51962 4 6.08009 4 7.2002V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H8M8 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H8M8 4V20M12 11H16M12 8H16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   download: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-5 md:size-4.5", className)}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   paperClip: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-[22px] md:size-5", className)}
         viewBox="0 0 20 20"
         {...props}
      >
         <g fill="currentColor">
            <path
               d="m8,7v4c0,1.105.895,2,2,2h0c1.105,0,2-.895,2-2v-4c0-2.209-1.791-4-4-4h0c-2.209,0-4,1.791-4,4v4c0,3.314,2.686,6,6,6h0c3.314,0,6-2.686,6-6v-4"
               fill="none"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="1.5"
            />
         </g>
      </svg>
   ),
   attachment: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-5 shrink-0", className)}
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 20 20"
         {...props}
      >
         <g fill="currentColor">
            <path
               d="m4,7h3c.552,0,1-.448,1-1v-3"
               stroke="currentColor"
               strokeLinejoin="round"
               strokeWidth="1.5"
               fill="currentColor"
            />
            <path
               d="m16,8.943v-2.943c0-1.657-1.343-3-3-3h-4.586c-.265,0-.52.105-.707.293l-3.414,3.414c-.188.188-.293.442-.293.707v6.586c0,1.657,1.343,3,3,3h1.24"
               fill="none"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="1.5"
            />
            <path
               d="m14,14v-1.5c0-.828-.672-1.5-1.5-1.5h0c-.828,0-1.5.672-1.5,1.5v1.5c0,1.657,1.343,3,3,3h0c1.657,0,3-1.343,3-3v-1"
               fill="none"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="2"
            />
         </g>
      </svg>
   ),
   info: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M12 11V16M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21ZM12.0498 8V8.1L11.9502 8.1002V8H12.0498Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   home: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M20 17.0002V11.4522C20 10.9179 19.9995 10.6506 19.9346 10.4019C19.877 10.1816 19.7825 9.97307 19.6546 9.78464C19.5102 9.57201 19.3096 9.39569 18.9074 9.04383L14.1074 4.84383C13.3608 4.19054 12.9875 3.86406 12.5674 3.73982C12.1972 3.63035 11.8026 3.63035 11.4324 3.73982C11.0126 3.86397 10.6398 4.19014 9.89436 4.84244L5.09277 9.04383C4.69064 9.39569 4.49004 9.57201 4.3457 9.78464C4.21779 9.97307 4.12255 10.1816 4.06497 10.4019C4 10.6506 4 10.9179 4 11.4522V17.0002C4 17.932 4 18.3978 4.15224 18.7654C4.35523 19.2554 4.74432 19.6452 5.23438 19.8482C5.60192 20.0005 6.06786 20.0005 6.99974 20.0005C7.93163 20.0005 8.39808 20.0005 8.76562 19.8482C9.25568 19.6452 9.64467 19.2555 9.84766 18.7654C9.9999 18.3979 10 17.932 10 17.0001V16.0001C10 14.8955 10.8954 14.0001 12 14.0001C13.1046 14.0001 14 14.8955 14 16.0001V17.0001C14 17.932 14 18.3979 14.1522 18.7654C14.3552 19.2555 14.7443 19.6452 15.2344 19.8482C15.6019 20.0005 16.0679 20.0005 16.9997 20.0005C17.9316 20.0005 18.3981 20.0005 18.7656 19.8482C19.2557 19.6452 19.6447 19.2554 19.8477 18.7654C19.9999 18.3978 20 17.932 20 17.0002Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   homeSolid: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M20 17.0002V11.4522C20 10.9179 19.9995 10.6506 19.9346 10.4019C19.877 10.1816 19.7825 9.97307 19.6546 9.78464C19.5102 9.57201 19.3096 9.39569 18.9074 9.04383L14.1074 4.84383C13.3608 4.19054 12.9875 3.86406 12.5674 3.73982C12.1972 3.63035 11.8026 3.63035 11.4324 3.73982C11.0126 3.86397 10.6398 4.19014 9.89436 4.84244L5.09277 9.04383C4.69064 9.39569 4.49004 9.57201 4.3457 9.78464C4.21779 9.97307 4.12255 10.1816 4.06497 10.4019C4 10.6506 4 10.9179 4 11.4522V17.0002C4 17.932 4 18.3978 4.15224 18.7654C4.35523 19.2554 4.74432 19.6452 5.23438 19.8482C5.60192 20.0005 6.06786 20.0005 6.99974 20.0005C7.93163 20.0005 8.39808 20.0005 8.76562 19.8482C9.25568 19.6452 9.64467 19.2555 9.84766 18.7654C9.9999 18.3979 10 17.932 10 17.0001V16.0001C10 14.8955 10.8954 14.0001 12 14.0001C13.1046 14.0001 14 14.8955 14 16.0001V17.0001C14 17.932 14 18.3979 14.1522 18.7654C14.3552 19.2555 14.7443 19.6452 15.2344 19.8482C15.6019 20.0005 16.0679 20.0005 16.9997 20.0005C17.9316 20.0005 18.3981 20.0005 18.7656 19.8482C19.2557 19.6452 19.6447 19.2554 19.8477 18.7654C19.9999 18.3978 20 17.932 20 17.0002Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   lineChart: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M3.8999 14.7502V16.37C3.8999 17.3781 3.8999 17.8818 4.09609 18.2668C4.26866 18.6055 4.54383 18.8814 4.88252 19.054C5.26718 19.25 5.771 19.25 6.77712 19.25H20.1001M3.8999 14.7502V5.75M3.8999 14.7502L7.36796 11.8602L7.37083 11.8579C7.9982 11.335 8.31249 11.0731 8.65329 10.9667C9.05588 10.8411 9.48954 10.861 9.8791 11.0226C10.2094 11.1596 10.4989 11.4491 11.0781 12.0283L11.0839 12.0341C11.672 12.6223 11.9669 12.9171 12.3025 13.0538C12.6995 13.2156 13.1416 13.2295 13.5485 13.0945C13.8936 12.9801 14.2087 12.7048 14.8388 12.1535L20.0999 7.55"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   barChart: (props: IconProps) => (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24"
         strokeWidth="2"
         stroke="currentColor"
         {...props}
      >
         <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
         />
      </svg>
   ),
   barChartSolid: (props: IconProps) => (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 24 24"
         fill="currentColor"
         {...props}
      >
         <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
      </svg>
   ),
   user: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M20 21C20 18.2386 16.4183 16 12 16C7.58172 16 4 18.2386 4 21M12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8C17 10.7614 14.7614 13 12 13Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
         />
      </svg>
   ),
   users: (props: IconProps) => (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 20 20"
         {...props}
      >
         <g fill="currentColor">
            <circle
               cx="6.5"
               cy="8.5"
               r="2.5"
               fill="none"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="2"
            />
            <circle
               cx="13.5"
               cy="5.5"
               r="2.5"
               fill="none"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="2"
            />
            <path
               d="m10.875,11.845c.739-.532,1.645-.845,2.625-.845,1.959,0,3.626,1.252,4.244,3"
               fill="none"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="2"
            />
            <path
               d="m2.256,17c.618-1.748,2.285-3,4.244-3s3.626,1.252,4.244,3"
               fill="none"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="2"
            />
         </g>
      </svg>
   ),
   usersSolid: (props: IconProps) => (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 20 20"
         {...props}
      >
         <g fill="currentColor">
            <circle
               cx="6.5"
               cy="8"
               r="2"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="2"
               fill="currentColor"
            />
            <circle
               cx="13.5"
               cy="5"
               r="2"
               fill="currentColor"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="2"
            />
            <path
               d="m18.16,12.226c-.744-1.96-2.573-3.226-4.66-3.226-1.509,0-2.876.669-3.803,1.776,1.498.77,2.699,2.071,3.332,3.74.058.153.092.309.127.465.115.005.229.02.344.02,1.297,0,2.594-.299,3.881-.898.711-.331,1.053-1.155.778-1.876Z"
               fill="currentColor"
               strokeWidth="0"
            />
            <path
               d="m11.16,15.226c-.744-1.96-2.573-3.226-4.66-3.226s-3.916,1.266-4.66,3.226c-.275.722.067,1.546.778,1.877,1.288.599,2.584.898,3.881.898s2.594-.299,3.881-.898c.711-.331,1.053-1.155.778-1.876Z"
               strokeWidth="0"
               fill="currentColor"
            />
         </g>
      </svg>
   ),
   calendar: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M4 8H20M4 8V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H16.8031C17.921 20 18.48 20 18.9074 19.7822C19.2837 19.5905 19.5905 19.2842 19.7822 18.9079C20 18.4805 20 17.9215 20 16.8036V8M4 8V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H8M20 8V7.19691C20 6.07899 20 5.5192 19.7822 5.0918C19.5905 4.71547 19.2837 4.40973 18.9074 4.21799C18.4796 4 17.9203 4 16.8002 4H16M16 2V4M16 4H8M8 2V4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   alert: (props: IconProps) => (
      <svg
         {...props}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M20.5734 14.8L14.8578 4.9C14.2616 3.8671 13.1924 3.25 12 3.25C10.8076 3.25 9.73837 3.8671 9.14217 4.9L3.42657 14.8C2.83037 15.8318 2.82927 17.0671 3.42657 18.1C4.02277 19.1329 5.09197 19.75 6.28437 19.75H17.7167C18.9091 19.75 19.9783 19.1329 20.5745 18.1C21.1707 17.0671 21.1696 15.8318 20.5734 14.8ZM10.9 8.75C10.9 8.1428 11.3917 7.65 12 7.65C12.6083 7.65 13.1 8.1428 13.1 8.75V12.6C13.1 13.2072 12.6083 13.7 12 13.7C11.3917 13.7 10.9 13.2072 10.9 12.6V8.75ZM12 17.55C11.2421 17.55 10.625 16.9329 10.625 16.175C10.625 15.4171 11.2421 14.8 12 14.8C12.7579 14.8 13.375 15.4171 13.375 16.175C13.375 16.9329 12.7579 17.55 12 17.55Z"
            fill="currentColor"
         />
      </svg>
   ),
   pin: (props: IconProps) => (
      <svg
         viewBox="0 0 34 34"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <g clipPath="url(#clip0_465_124)">
            <path
               d="M10.196 25.9692L13.9724 21.2144"
               stroke="currentColor"
               strokeWidth="2.5"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
            <path
               d="M20.213 26.171C20.7672 25.2561 21.4966 23.7787 21.7755 21.8387C21.9192 20.8401 21.9104 19.953 21.8481 19.2309L25.8606 14.179C26.9039 12.8655 26.685 10.9566 25.3715 9.91336L22.3998 7.55307C21.0863 6.50982 19.1774 6.72871 18.1342 8.04221L14.1217 13.0941C13.403 13.196 12.5369 13.3882 11.598 13.7552C9.77265 14.4669 8.49755 15.5109 7.73182 16.2578L20.213 26.171Z"
               stroke="currentColor"
               strokeWidth="2.5"
               strokeLinecap="round"
               strokeLinejoin="round"
            />
         </g>
         <defs>
            <clipPath id="clip0_465_124">
               <rect
                  width="24"
                  height="24"
                  fill="currentColor"
                  transform="translate(15.0671 0.139832) rotate(38.4584)"
               />
            </clipPath>
         </defs>
      </svg>
   ),
   exit: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M12 15L15 12M15 12L12 9M15 12H4M4 7.24802V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2839 4.21799 18.9076C4 18.4798 4 17.9201 4 16.8V16.75"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   filter: (props: IconProps) => (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 20 20"
         {...props}
      >
         <g fill="currentColor">
            <line
               x1="14"
               y1="10"
               x2="6"
               y2="10"
               fill="none"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="2"
            />
            <line
               x1="3"
               y1="5"
               x2="17"
               y2="5"
               fill="none"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="2"
            />
            <line
               x1="9"
               y1="15"
               x2="11"
               y2="15"
               fill="none"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="2"
            />
         </g>
      </svg>
   ),
   circle: ({ ...props }: IconProps) => (
      <svg
         viewBox="0 0 20 20"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M10 4C6.68629 4 4 6.68629 4 10C4 13.3137 6.68629 16 10 16C13.3137 16 16 13.3137 16 10C16 6.68629 13.3137 4 10 4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   circleCheckDotted: ({ ...props }: IconProps) => (
      <svg
         {...props}
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 18 18"
      >
         <g fill="currentColor">
            <path
               d="M9,1.75c4.004,0,7.25,3.246,7.25,7.25s-3.246,7.25-7.25,7.25"
               fill="none"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="1.6"
            />
            <polyline
               points="5.75 9.25 8 11.75 12.25 6.25"
               fill="none"
               stroke="currentColor"
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth="1.6"
            />
            <circle
               cx="3.873"
               cy="14.127"
               r=".75"
               fill="currentColor"
               stroke="none"
            />
            <circle
               cx="1.75"
               cy="9"
               r=".75"
               fill="currentColor"
               stroke="none"
            />
            <circle
               cx="3.873"
               cy="3.873"
               r=".75"
               fill="currentColor"
               stroke="none"
            />
            <circle
               cx="6.226"
               cy="15.698"
               r=".75"
               fill="currentColor"
               stroke="none"
            />
            <circle
               cx="2.302"
               cy="11.774"
               r=".75"
               fill="currentColor"
               stroke="none"
            />
            <circle
               cx="2.302"
               cy="6.226"
               r=".75"
               fill="currentColor"
               stroke="none"
            />
            <circle
               cx="6.226"
               cy="2.302"
               r=".75"
               fill="currentColor"
               stroke="none"
            />
         </g>
      </svg>
   ),
   undo: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-5 md:size-4", className)}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M7 13L3 9M3 9L7 5M3 9H16C18.7614 9 21 11.2386 21 14C21 16.7614 18.7614 19 16 19H11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   reload: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M14 16H19V21M10 8H5V3M19.4176 9.0034C18.8569 7.61566 17.9181 6.41304 16.708 5.53223C15.4979 4.65141 14.0652 4.12752 12.5723 4.02051C11.0794 3.9135 9.58606 4.2274 8.2627 4.92661C6.93933 5.62582 5.83882 6.68254 5.08594 7.97612M4.58203 14.9971C5.14272 16.3848 6.08146 17.5874 7.29157 18.4682C8.50169 19.3491 9.93588 19.8723 11.4288 19.9793C12.9217 20.0863 14.4138 19.7725 15.7371 19.0732C17.0605 18.374 18.1603 17.3175 18.9131 16.0239"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   archive: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M6.60035 9H17.4003M6.60035 9C6.04029 9 5.75957 9 5.54566 9.10899C5.3575 9.20487 5.20463 9.35774 5.10875 9.5459C4.99976 9.75981 4.99976 10.04 4.99976 10.6001V15.8001C4.99976 16.9202 4.99976 17.4804 5.21775 17.9082C5.40949 18.2845 5.71523 18.5905 6.09156 18.7822C6.51896 19 7.07875 19 8.19667 19H15.8025C16.9204 19 17.4794 19 17.9068 18.7822C18.2831 18.5905 18.5902 18.2844 18.782 17.9081C18.9998 17.4807 18.9998 16.9216 18.9998 15.8037V10.591C18.9998 10.037 18.9998 9.75865 18.8914 9.5459C18.7955 9.35774 18.6419 9.20487 18.4538 9.10899C18.2398 9 17.9604 9 17.4003 9M6.60035 9H4.97507C4.12597 9 3.70168 9 3.4607 8.85156C3.13911 8.65347 2.95678 8.29079 2.98902 7.91447C3.0132 7.63223 3.26593 7.29089 3.77222 6.60739C3.91866 6.40971 3.99189 6.31084 4.08152 6.23535C4.20104 6.1347 4.34286 6.06322 4.49488 6.02709C4.60889 6 4.73126 6 4.9773 6H19.0217C19.2677 6 19.3904 6 19.5044 6.02709C19.6564 6.06322 19.7982 6.1347 19.9177 6.23535C20.0074 6.31084 20.0809 6.40924 20.2273 6.60693C20.7336 7.29042 20.9867 7.63218 21.0109 7.91442C21.0432 8.29074 20.8602 8.65347 20.5386 8.85156C20.2976 9 19.8723 9 19.0232 9H17.4003M9.99976 14H13.9998"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   trash: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-5 md:size-4", className)}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M14 10V17M10 10V17M6 6V17.8C6 18.9201 6 19.4798 6.21799 19.9076C6.40973 20.2839 6.71547 20.5905 7.0918 20.7822C7.5192 21 8.07899 21 9.19691 21H14.8031C15.921 21 16.48 21 16.9074 20.7822C17.2837 20.5905 17.5905 20.2839 17.7822 19.9076C18 19.4802 18 18.921 18 17.8031V6M6 6H8M6 6H4M8 6H16M8 6C8 5.06812 8 4.60241 8.15224 4.23486C8.35523 3.74481 8.74432 3.35523 9.23438 3.15224C9.60192 3 10.0681 3 11 3H13C13.9319 3 14.3978 3 14.7654 3.15224C15.2554 3.35523 15.6447 3.74481 15.8477 4.23486C15.9999 4.6024 16 5.06812 16 6M16 6H18M18 6H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   briefcase: ({ className, ...props }: IconProps) => (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24"
         strokeWidth="1.5"
         stroke="currentColor"
         className="size-5"
         {...props}
      >
         <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
         />
      </svg>
   ),
   empty: ({ className, ...props }: IconProps) => (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         className="size-12"
         viewBox="0 0 18 18"
         {...props}
      >
         <g fill="currentColor">
            <path
               d="M15.75,8.5c-.414,0-.75-.336-.75-.75v-1.5c0-.689-.561-1.25-1.25-1.25h-5.386c-.228,0-.443-.104-.585-.281l-.603-.752c-.238-.297-.594-.467-.975-.467h-1.951c-.689,0-1.25,.561-1.25,1.25v3c0,.414-.336,.75-.75,.75s-.75-.336-.75-.75v-3c0-1.517,1.233-2.75,2.75-2.75h1.951c.838,0,1.62,.375,2.145,1.029l.378,.471h5.026c1.517,0,2.75,1.233,2.75,2.75v1.5c0,.414-.336,.75-.75,.75Z"
               fill="currentColor"
            />
            <path
               d="M17.082,7.879c-.43-.559-1.08-.879-1.785-.879H2.703c-.705,0-1.355,.32-1.785,.879-.429,.559-.571,1.27-.39,1.951l1.101,4.128c.32,1.202,1.413,2.042,2.657,2.042H13.713c1.244,0,2.337-.839,2.657-2.042l1.101-4.128c.182-.681,.04-1.392-.39-1.951Z"
               fill="currentColor"
            />
         </g>
      </svg>
   ),
   gear: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M9.59396 3.94C9.68396 3.398 10.154 3 10.704 3H13.297C13.847 3 14.317 3.398 14.407 3.94L14.62 5.221C14.683 5.595 14.933 5.907 15.265 6.091C15.339 6.131 15.412 6.174 15.485 6.218C15.81 6.414 16.205 6.475 16.56 6.342L17.777 5.886C18.0264 5.79221 18.301 5.78998 18.5518 5.87971C18.8027 5.96945 19.0136 6.14531 19.147 6.376L20.443 8.623C20.576 8.8537 20.6229 9.12413 20.5753 9.38617C20.5277 9.6482 20.3887 9.88485 20.183 10.054L19.18 10.881C18.887 11.122 18.742 11.494 18.75 11.873C18.7514 11.958 18.7514 12.043 18.75 12.128C18.742 12.506 18.887 12.878 19.18 13.119L20.184 13.946C20.608 14.296 20.718 14.901 20.444 15.376L19.146 17.623C19.0128 17.8536 18.8022 18.0296 18.5515 18.1195C18.3008 18.2094 18.0263 18.2074 17.777 18.114L16.56 17.658C16.205 17.525 15.81 17.586 15.484 17.782C15.4115 17.8261 15.3381 17.8688 15.264 17.91C14.933 18.093 14.683 18.405 14.62 18.779L14.407 20.06C14.317 20.603 13.847 21 13.297 21H10.703C10.153 21 9.68396 20.602 9.59296 20.06L9.37996 18.779C9.31796 18.405 9.06796 18.093 8.73596 17.909C8.66181 17.8681 8.58846 17.8258 8.51596 17.782C8.19096 17.586 7.79596 17.525 7.43996 17.658L6.22296 18.114C5.97369 18.2075 5.69933 18.2096 5.44866 18.1199C5.19799 18.0302 4.98727 17.8545 4.85396 17.624L3.55696 15.377C3.4239 15.1463 3.37701 14.8759 3.42462 14.6138C3.47223 14.3518 3.61125 14.1152 3.81696 13.946L4.82096 13.119C5.11296 12.879 5.25796 12.506 5.25096 12.128C5.2494 12.043 5.2494 11.958 5.25096 11.873C5.25796 11.493 5.11296 11.122 4.82096 10.881L3.81696 10.054C3.6115 9.88489 3.47264 9.64843 3.42503 9.38662C3.37743 9.12481 3.42418 8.8546 3.55696 8.624L4.85396 6.377C4.98715 6.14614 5.19797 5.97006 5.44887 5.88014C5.69977 5.79021 5.97445 5.79229 6.22396 5.886L7.43996 6.342C7.79596 6.475 8.19096 6.414 8.51596 6.218C8.58796 6.174 8.66196 6.132 8.73596 6.09C9.06796 5.907 9.31796 5.595 9.37996 5.221L9.59396 3.94Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7956 15 12 15C11.2044 15 10.4413 14.6839 9.87868 14.1213C9.31607 13.5587 9 12.7956 9 12C9 11.2044 9.31607 10.4413 9.87868 9.87868C10.4413 9.31607 11.2044 9 12 9C12.7956 9 13.5587 9.31607 14.1213 9.87868C14.6839 10.4413 15 11.2044 15 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   gearSolid: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M11.0779 2.25C10.1609 2.25 9.37893 2.913 9.22793 3.817L9.04993 4.889C9.02993 5.009 8.93493 5.149 8.75293 5.237C8.41028 5.40171 8.08067 5.59226 7.76693 5.807C7.60093 5.922 7.43293 5.933 7.31693 5.89L6.29993 5.508C5.88418 5.35224 5.42663 5.34906 5.00875 5.49904C4.59087 5.64901 4.23976 5.94241 4.01793 6.327L3.09593 7.924C2.87402 8.30836 2.79565 8.75897 2.87475 9.19569C2.95385 9.6324 3.18531 10.0269 3.52793 10.309L4.36793 11.001C4.46293 11.079 4.53793 11.23 4.52193 11.431C4.49344 11.8101 4.49344 12.1909 4.52193 12.57C4.53693 12.77 4.46293 12.922 4.36893 13L3.52793 13.692C3.18531 13.9741 2.95385 14.3686 2.87475 14.8053C2.79565 15.242 2.87402 15.6926 3.09593 16.077L4.01793 17.674C4.23992 18.0584 4.59109 18.3516 5.00896 18.5014C5.42683 18.6512 5.88429 18.6478 6.29993 18.492L7.31893 18.11C7.43393 18.067 7.60193 18.079 7.76893 18.192C8.08093 18.406 8.40993 18.597 8.75393 18.762C8.93593 18.85 9.03093 18.99 9.05093 19.112L9.22893 20.183C9.37993 21.087 10.1619 21.75 11.0789 21.75H12.9229C13.8389 21.75 14.6219 21.087 14.7729 20.183L14.9509 19.111C14.9709 18.991 15.0649 18.851 15.2479 18.762C15.5919 18.597 15.9209 18.406 16.2329 18.192C16.3999 18.078 16.5679 18.067 16.6829 18.11L17.7029 18.492C18.1184 18.6472 18.5755 18.6501 18.993 18.5002C19.4104 18.3502 19.7612 18.0571 19.9829 17.673L20.9059 16.076C21.1278 15.6916 21.2062 15.241 21.1271 14.8043C21.048 14.3676 20.8166 13.9731 20.4739 13.691L19.6339 12.999C19.5389 12.921 19.4639 12.77 19.4799 12.569C19.5084 12.1899 19.5084 11.8091 19.4799 11.43C19.4639 11.23 19.5389 11.078 19.6329 11L20.4729 10.308C21.1809 9.726 21.3639 8.718 20.9059 7.923L19.9839 6.326C19.7619 5.94159 19.4108 5.6484 18.9929 5.49861C18.575 5.34883 18.1176 5.35215 17.7019 5.508L16.6819 5.89C16.5679 5.933 16.3999 5.921 16.2329 5.807C15.9195 5.5923 15.5902 5.40175 15.2479 5.237C15.0649 5.15 14.9709 5.01 14.9509 4.889L14.7719 3.817C14.699 3.37906 14.473 2.98122 14.1343 2.69427C13.7955 2.40732 13.3659 2.24989 12.9219 2.25H11.0789H11.0779ZM11.9999 15.75C12.9945 15.75 13.9483 15.3549 14.6516 14.6517C15.3548 13.9484 15.7499 12.9946 15.7499 12C15.7499 11.0054 15.3548 10.0516 14.6516 9.34835C13.9483 8.64509 12.9945 8.25 11.9999 8.25C11.0054 8.25 10.0515 8.64509 9.34828 9.34835C8.64502 10.0516 8.24993 11.0054 8.24993 12C8.24993 12.9946 8.64502 13.9484 9.34828 14.6517C10.0515 15.3549 11.0054 15.75 11.9999 15.75Z"
            fill="currentColor"
         />
      </svg>
   ),
   search: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M15 15L21 21M10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   xMark: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-5 md:size-4", className)}
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 18 18"
         {...props}
      >
         <g fill="currentColor">
            <path
               d="M14 4L4 14"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
               fill="none"
            />{" "}
            <path
               d="M4 4L14 14"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
               fill="none"
            />
         </g>
      </svg>
   ),
   arrowUp: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M12 19V5M12 5L6 11M12 5L18 11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   arrowUpRight: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M8 16L16 8M16 8H10M16 8V14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   arrowDownRight: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M8 8L16 16M16 16V10M16 16H10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   arrowDownLeft: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M7 11L3 15M3 15L7 19M3 15H16C18.7614 15 21 12.7614 21 10C21 7.23858 18.7614 5 16 5H11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   arrowLeft: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-6", className)}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M19 12H5M5 12L11 18M5 12L11 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   checkAll: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-6 md:size-[22px]", className)}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M8 12.4854L12.2426 16.728L20.727 8.24268M3 12.4854L7.24264 16.728M15.7279 8.24268L12.5 11.5001"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   chevronLeft: (props: IconProps) => (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24"
         strokeWidth="2"
         stroke="currentColor"
         {...props}
      >
         <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
         />
      </svg>
   ),
   chevronRight: (props: IconProps) => (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24"
         strokeWidth="2"
         stroke="currentColor"
         {...props}
      >
         <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
         />
      </svg>
   ),
   chevronUpDuo: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M8 17L12 13L16 17M8 11L12 7L16 11"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   chevronDown: (props: IconProps) => (
      <svg
         viewBox="0 0 10 7"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M1 1.13916C2.06206 2.60104 3.30708 3.91044 4.70212 5.03336C4.87737 5.17443 5.12263 5.17443 5.29788 5.03336C6.69292 3.91044 7.93794 2.60104 9 1.13916"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   chevronUpDown: (props: IconProps) => (
      <svg
         xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24"
         strokeWidth="2"
         stroke="currentColor"
         {...props}
      >
         <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
         />
      </svg>
   ),
   arrowsLeftRight: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M16 13L19 16M19 16L16 19M19 16H5M8 11L5 8M5 8L8 5M5 8H19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   ellipsisHorizontal: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-6", className)}
         xmlns="http://www.w3.org/2000/svg"
         fill="none"
         viewBox="0 0 24 24"
         strokeWidth="1.5"
         stroke="currentColor"
         {...props}
      >
         <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
         />
      </svg>
   ),
   plus: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-6 md:size-5", className)}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M6 12H12M12 12H18M12 12V18M12 12V6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   minus: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-6 md:size-5", className)}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M6 12H18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   check: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M6 12L10.2426 16.2426L18.727 7.75732"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   pencil: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M12 8.00012L4 16.0001V20.0001L8 20.0001L16 12.0001M12 8.00012L14.8686 5.13146L14.8704 5.12976C15.2652 4.73488 15.463 4.53709 15.691 4.46301C15.8919 4.39775 16.1082 4.39775 16.3091 4.46301C16.5369 4.53704 16.7345 4.7346 17.1288 5.12892L18.8686 6.86872C19.2646 7.26474 19.4627 7.46284 19.5369 7.69117C19.6022 7.89201 19.6021 8.10835 19.5369 8.3092C19.4628 8.53736 19.265 8.73516 18.8695 9.13061L18.8686 9.13146L16 12.0001M12 8.00012L16 12.0001"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   pencilLine: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M4 20.0001H20M4 20.0001V16.0001L12 8.00012M4 20.0001L8 20.0001L16 12.0001M12 8.00012L14.8686 5.13146L14.8704 5.12976C15.2652 4.73488 15.463 4.53709 15.691 4.46301C15.8919 4.39775 16.1082 4.39775 16.3091 4.46301C16.5369 4.53704 16.7345 4.7346 17.1288 5.12892L18.8686 6.86872C19.2646 7.26474 19.4627 7.46284 19.5369 7.69117C19.6022 7.89201 19.6021 8.10835 19.5369 8.3092C19.4628 8.53736 19.265 8.73516 18.8695 9.13061L18.8686 9.13146L16 12.0001M12 8.00012L16 12.0001"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
   lightBulb: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-5 md:size-4", className)}
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M9 21H15M12 3C8.68629 3 6 5.68629 6 9C6 10.2145 6.36084 11.3447 6.98117 12.2893C7.93507 13.7418 8.41161 14.4676 8.47352 14.5761C9.02428 15.541 8.92287 15.2007 8.99219 16.3096C8.99998 16.4342 9 16.6229 9 17C9 17.5523 9.44772 18 10 18L14 18C14.5523 18 15 17.5523 15 17C15 16.6229 15 16.4342 15.0078 16.3096C15.0771 15.2007 14.9751 15.541 15.5259 14.5761C15.5878 14.4676 16.0651 13.7418 17.019 12.2893C17.6394 11.3447 18.0002 10.2145 18.0002 9C18.0002 5.68629 15.3137 3 12 3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
      </svg>
   ),
}
