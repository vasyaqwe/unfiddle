import { cn } from "../utils"

type IconProps = React.ComponentProps<"svg">

export const Icons = {
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
   archive: ({ className, ...props }: IconProps) => (
      <svg
         className={cn("size-5 md:size-4", className)}
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
   gear: (props: IconProps) => (
      <svg
         viewBox="0 0 24 24"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
         {...props}
      >
         <path
            d="M19.5149 9.23061L19.1853 9.04726C19.1341 9.01878 19.1089 9.0045 19.0842 8.98969C18.8384 8.84246 18.6312 8.63905 18.4801 8.39568C18.4649 8.37119 18.4505 8.34552 18.4212 8.29476C18.3919 8.24407 18.3771 8.21839 18.3635 8.19296C18.2279 7.93977 18.1545 7.65761 18.1501 7.37043C18.1497 7.34156 18.1498 7.31206 18.1508 7.25342L18.1572 6.87068C18.1675 6.2582 18.1727 5.95102 18.0866 5.67533C18.0102 5.43046 17.8823 5.20491 17.7115 5.0135C17.5184 4.79714 17.2512 4.64278 16.7161 4.33446L16.2717 4.07836C15.7381 3.7709 15.4713 3.61711 15.188 3.55849C14.9374 3.50662 14.6788 3.50902 14.4291 3.56508C14.1473 3.62834 13.8837 3.78614 13.357 4.10154L13.354 4.10297L13.0356 4.29364C12.9852 4.32379 12.9597 4.33899 12.9345 4.35302C12.684 4.49227 12.4044 4.56926 12.118 4.57846C12.0892 4.57938 12.0598 4.57938 12.0011 4.57938C11.9427 4.57938 11.9121 4.57938 11.8833 4.57846C11.5963 4.56922 11.3161 4.49181 11.0653 4.35199C11.04 4.3379 11.015 4.32258 10.9645 4.29229L10.644 4.09989C10.1137 3.7815 9.84813 3.62207 9.56475 3.55849C9.31404 3.50223 9.05454 3.50068 8.80302 3.55321C8.51902 3.61253 8.25209 3.76746 7.71823 4.0773L7.71585 4.07836L7.27696 4.33309L7.2721 4.33606C6.74304 4.64312 6.47787 4.79702 6.28643 5.0125C6.11654 5.20371 5.98956 5.42891 5.91356 5.67313C5.82765 5.9492 5.83223 6.25704 5.84258 6.8724L5.84901 7.2546C5.84999 7.31247 5.85167 7.34123 5.85125 7.3697C5.84699 7.65747 5.77268 7.9402 5.63667 8.19384C5.62322 8.21892 5.60873 8.24401 5.57979 8.29411C5.55083 8.34425 5.5368 8.36919 5.52178 8.39338C5.36993 8.63805 5.16183 8.84265 4.9145 8.99013C4.89004 9.00472 4.86425 9.01874 4.8136 9.04682L4.48819 9.22715C3.94678 9.52718 3.67614 9.67733 3.4792 9.891C3.30499 10.08 3.17338 10.3042 3.09304 10.5484C3.00223 10.8245 3.00231 11.134 3.00371 11.753L3.00486 12.2589C3.00626 12.8737 3.00818 13.181 3.09919 13.4551C3.17971 13.6977 3.31036 13.9206 3.4836 14.1084C3.67942 14.3208 3.94737 14.47 4.48467 14.7689L4.80718 14.9483C4.86206 14.9789 4.88968 14.994 4.91615 15.0099C5.16123 15.1575 5.36771 15.3615 5.51827 15.6048C5.53453 15.6311 5.55015 15.6583 5.58137 15.7129C5.61221 15.7668 5.62798 15.7937 5.64225 15.8207C5.77425 16.0706 5.84493 16.3483 5.84975 16.6309C5.85027 16.6614 5.84982 16.6923 5.84877 16.7544L5.84258 17.1212C5.83216 17.7386 5.82762 18.0477 5.91403 18.3245C5.99048 18.5694 6.11826 18.7949 6.28907 18.9864C6.48214 19.2027 6.7498 19.357 7.28487 19.6653L7.7292 19.9214C8.26277 20.2288 8.52945 20.3824 8.81272 20.4411C9.06332 20.4929 9.32208 20.4909 9.57178 20.4349C9.854 20.3715 10.1184 20.2132 10.6467 19.8969L10.9651 19.7062C11.0155 19.676 11.041 19.6609 11.0663 19.6469C11.3167 19.5076 11.596 19.4302 11.8824 19.421C11.9113 19.4201 11.9406 19.4201 11.9994 19.4201C12.0582 19.4201 12.0875 19.4201 12.1165 19.421C12.4035 19.4303 12.6845 19.5079 12.9354 19.6477C12.9574 19.66 12.9795 19.6733 13.0184 19.6967L13.3569 19.8999C13.8873 20.2183 14.1523 20.3773 14.4357 20.4409C14.6864 20.4971 14.9461 20.4994 15.1977 20.4469C15.4816 20.3876 15.749 20.2324 16.2826 19.9227L16.7281 19.6641C17.2575 19.3569 17.523 19.2028 17.7145 18.9872C17.8844 18.796 18.0115 18.5709 18.0875 18.3267C18.1728 18.0527 18.1676 17.7472 18.1574 17.1407L18.1508 16.7452C18.1498 16.6873 18.1497 16.6585 18.1501 16.63C18.1544 16.3423 18.2275 16.0593 18.3635 15.8057C18.3769 15.7806 18.3915 15.7554 18.4204 15.7054C18.4493 15.6553 18.4643 15.6303 18.4793 15.6061C18.6312 15.3614 18.8395 15.1566 19.0868 15.0092C19.111 14.9948 19.1359 14.981 19.1853 14.9536L19.187 14.9528L19.5124 14.7725C20.0538 14.4724 20.325 14.3221 20.5219 14.1084C20.6961 13.9194 20.8276 13.6955 20.9079 13.4513C20.9982 13.1769 20.9975 12.8692 20.9961 12.2574L20.9949 11.7407C20.9935 11.1258 20.9928 10.8186 20.9018 10.5445C20.8212 10.3019 20.6899 10.079 20.5166 9.89114C20.321 9.67897 20.0527 9.52971 19.5164 9.23138L19.5149 9.23061Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
         />
         <path
            d="M8.4002 11.9999C8.4002 13.9882 10.012 15.5999 12.0002 15.5999C13.9884 15.5999 15.6002 13.9882 15.6002 11.9999C15.6002 10.0117 13.9884 8.39994 12.0002 8.39994C10.012 8.39994 8.4002 10.0117 8.4002 11.9999Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
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
}
