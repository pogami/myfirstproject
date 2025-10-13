interface CCLogoProps {
  className?: string;
}

export function CCLogo({ className = "h-10 w-auto" }: CCLogoProps) {
  return (
    <img 
      src="/officialogo.png"
      alt="CourseConnect Logo"
      className={className}
    />
  );
}

// White version for dark backgrounds (same image, CSS will handle it if needed)
export function CCLogoWhite({ className = "h-10 w-auto" }: { className?: string }) {
  return <CCLogo className={className} />;
}

// Blue version (same image)
export function CCLogoBlue({ className = "h-10 w-auto" }: { className?: string }) {
  return <CCLogo className={className} />;
}
