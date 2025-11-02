export function AnalyzingIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            {...props}
        >
            <style>{`
                .scan-line {
                    stroke: hsl(var(--primary));
                    stroke-width: 3;
                    animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                @keyframes scan {
                    0% {
                        transform: translateY(0px);
                        opacity: 0.5;
                    }
                    50% {
                        transform: translateY(45px);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(0px);
                        opacity: 0.5;
                    }
                }
                 .sparkle {
                    fill: hsl(var(--primary));
                    animation: sparkle 2s ease-in-out infinite;
                    opacity: 0;
                }
                .sparkle-1 { animation-delay: 0.2s; }
                .sparkle-2 { animation-delay: 0.8s; }
                .sparkle-3 { animation-delay: 1.3s; }
                .sparkle-4 { animation-delay: 1.8s; }

                @keyframes sparkle {
                    0% { transform: scale(0.5); opacity: 0; }
                    25% { transform: scale(1.2); opacity: 1; }
                    50%, 100% { transform: scale(0.5); opacity: 0; }
                }

            `}</style>
            <path
                d="M30 15 H 60 L 70 25 V 85 H 30 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary/20"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <path
                d="M60 15 V 25 H 70"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary/20"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            
            <g transform="translate(30, 28)">
                <line x1="8" y1="0" x2="32" y2="0" className="scan-line" />
            </g>

            <g>
                <path d="M 45 45 l -1.5 4 l -4 1.5 l 4 1.5 l 1.5 4 l 1.5 -4 l 4 -1.5 l -4 -1.5 l -1.5 -4 z" className="sparkle sparkle-1" />
                <path d="M 62 65 l -1.5 4 l -4 1.5 l 4 1.5 l 1.5 4 l 1.5 -4 l 4 -1.5 l -4 -1.5 l -1.5 -4 z" className="sparkle sparkle-2" />
                <path d="M 38 70 l -1 2.5 l -2.5 1 l 2.5 1 l 1 2.5 l 1 -2.5 l 2.5 -1 l -2.5 -1 l -1 -2.5 z" className="sparkle sparkle-3" />
                <path d="M 65 35 l -1 2.5 l -2.5 1 l 2.5 1 l 1 2.5 l 1 -2.5 l 2.5 -1 l -2.5 -1 l -1 -2.5 z" className="sparkle sparkle-4" />
            </g>
        </svg>
    );
}
