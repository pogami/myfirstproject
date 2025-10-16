"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase/client-simple";
import { useNotifications } from "@/hooks/use-notifications";
import { createGuestNotification } from "@/lib/guest-notifications";

export default function TestNotificationsPage() {
  const user = auth.currentUser as any;
  const { createNotification } = useNotifications(user);

  const openBell = () => {
    window.dispatchEvent(new Event("open-notifications"));
  };

  const createGuest = () => {
    createGuestNotification({
      title: "Guest test",
      description: "This is a guest test notification",
      type: "system",
      priority: "medium",
    });
  };

  const createLoggedIn = async () => {
    if (!auth.currentUser) {
      alert("Sign in first to create a Firestore notification.");
      return;
    }
    await createNotification({
      title: "User test",
      description: "This is a Firestore test notification",
        type: "system",
        priority: "medium",
    } as any);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Test Notifications</h1>
      <div className="grid gap-3">
        <Button onClick={openBell}>Open Bell</Button>
        <Button variant="secondary" onClick={createGuest}>Create Guest Notification</Button>
        <Button variant="outline" onClick={createLoggedIn}>Create Logged-in Notification</Button>
          </div>
      <p className="text-sm text-muted-foreground mt-4">
        Tip: Click Open Bell to show the dropdown. Create a notification, then open the bell.
      </p>
    </div>
  );
}
