export function CourseConnectLogo(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            {...props}>
            <g className="fill-none stroke-current stroke-[8] stroke-linecap-round stroke-linejoin-round">
                <path d="M75,25 A30,30 0 1,0 75,75" />
                <path d="M60,50 A15,15 0 1,0 60,50" />
                <path d="M25,25 A30,30 0 1,1 25,75" />
                <path d="M40,50 A15,15 0 1,1 40,50" />
            </g>
        </svg>
    )
}
