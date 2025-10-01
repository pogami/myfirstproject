"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to login page with signup state
        router.replace('/login?state=signup');
    }, [router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-transparent p-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Redirecting to signup...</p>
            </div>
        </div>
    );
}
