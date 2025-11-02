"use client";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
