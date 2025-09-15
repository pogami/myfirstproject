
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CalendarClock, GraduationCap, MailWarning } from "lucide-react";

const notifications = [
    {
        icon: <CalendarClock className="h-5 w-5 text-blue-500" />,
        title: "Upcoming: Mid-term Exam",
        description: "Your MATH-101 mid-term is next Tuesday.",
    },
    {
        icon: <GraduationCap className="h-5 w-5 text-green-500" />,
        title: "Deadline: Project Proposal",
        description: "CS-202 project proposal due this Friday.",
    },
    {
        icon: <MailWarning className="h-5 w-5 text-yellow-600" />,
        title: "Message from Advisor",
        description: "Check your inbox for an important message.",
    },
    {
        icon: <Bell className="h-5 w-5 text-red-500" />,
        title: "FAFSA Reminder",
        description: "The deadline for FAFSA is approaching soon.",
    },
];

export default function Notifications() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell/> Notifications</CardTitle>
                <CardDescription>Stay on top of your academic life.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {notifications.map((notif, index) => (
                        <div key={index} className="flex items-start gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="mt-1 h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-full bg-muted">
                                {notif.icon}
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold">{notif.title}</p>
                                <p className="text-sm text-muted-foreground">{notif.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
