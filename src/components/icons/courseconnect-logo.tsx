export function CourseConnectLogo(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            {...props}>
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#3b82f6', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#1d4ed8', stopOpacity: 1}} />
                </linearGradient>
            </defs>
            <rect width="100" height="100" rx="20" fill="url(#grad1)"/>
            {/* Interlocking 'X' shape with circles at endpoints */}
            <g>
                <path d="M 25 25 C 35 15, 65 85, 75 75" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 25 75 C 35 85, 65 15, 75 25" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="25" cy="25" r="4" fill="white" />
                <circle cx="75" cy="75" r="4" fill="white" />
                <circle cx="25" cy="75" r="4" fill="white" />
                <circle cx="75" cy="25" r="4" fill="white" />
            </g>
        </svg>
    )
}
