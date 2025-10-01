"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PublicChatDemoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/chat?tab=public-general-chat");
  }, [router]);

  return null;
}


