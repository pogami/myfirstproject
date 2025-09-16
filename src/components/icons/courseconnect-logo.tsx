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
            <g fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M75,25 A30,30 0 1,0 75,75" />
                <path d="M60,50 A15,15 0 1,0 60,50" />
                <path d="M25,25 A30,30 0 1,1 25,75" />
                <path d="M40,50 A15,15 0 1,1 40,50" />
            </g>
            {/* Add "CC" text to make it more distinctive */}
            <text x="50" y="60" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" textAnchor="middle" fill="white">CC</text>
        </svg>
    )
}
