'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Wifi, Bell, Mail, Globe2, Activity, Cpu, Users, Database } from 'lucide-react';
import { MotionCard, MotionHeadline, MotionSection } from '@/components/ui/motion-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/landing/footer';
import { Navigation } from '@/components/landing/navigation';
// Avoid importing server-only ollama library on client; use API route instead
import { rtdb } from '@/lib/firebase/client';
import { onValue, ref } from 'firebase/database';

interface ServiceStatus {
  name: string;
  ok: boolean;
  value?: string | number;
  icon: React.ReactNode;
  description?: string;
}

export default function StatusPage() {
  const [isClient, setIsClient] = useState(false);
  const [emailSubscribers, setEmailSubscribers] = useState<number | null>(null);
  const [pushSubscribers, setPushSubscribers] = useState<number | null>(null);
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [ollamaHealthy, setOllamaHealthy] = useState<boolean | null>(null);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [rtdbConnected, setRtdbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const poll = () => {
      // Email subscriber count
      fetch('/api/changelog-email')
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => setEmailSubscribers(data.subscriberCount ?? 0))
        .catch(() => setEmailSubscribers(0));

      // Push subscribers
      fetch('/api/push-notifications/subscribe')
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => setPushSubscribers(data.totalSubscriptions ?? 0))
        .catch(() => setPushSubscribers(0));

      // Simple API health check via newsletter GET with email param
      fetch('/api/newsletter?email=status-check@example.com')
        .then(res => setApiHealthy(res.ok))
        .catch(() => setApiHealthy(false));

      // LLM/Ollama availability
      fetch('/api/status/ollama')
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => setOllamaHealthy(!!data.ok))
        .catch(() => setOllamaHealthy(false));
    };

    // initial poll
    poll();
    // poll every 30s
    const intervalId = setInterval(poll, 30000);

    // Firebase RTDB status and online users
    try {
      const connectedRef = ref(rtdb, '.info/connected');
      const allStatusRef = ref(rtdb, 'status');

      const off1 = onValue(connectedRef, snap => {
        setRtdbConnected(!!snap.val());
      });
      const off2 = onValue(allStatusRef, snap => {
        const users = snap.val();
        if (users) {
          const count = Object.values(users).filter((u: any) => u?.state === 'online').length;
          setActiveUsers(count);
        } else {
          setActiveUsers(0);
        }
      });

      return () => {
        off1();
        off2();
      };
    } catch {
      setRtdbConnected(false);
      setActiveUsers(0);
    }
    return () => clearInterval(intervalId);
  }, []);

  const services: ServiceStatus[] = useMemo(() => [
    {
      name: 'Website',
      ok: true,
      value: 'Operational',
      icon: <Globe2 className="h-5 w-5" />,
      description: 'Static assets and routing'
    },
    {
      name: 'APIs',
      ok: apiHealthy ?? false,
      value: apiHealthy == null ? 'Checking…' : apiHealthy ? 'Healthy' : 'Degraded',
      icon: <Activity className="h-5 w-5" />,
      description: 'Core Next.js API routes'
    },
    {
      name: 'Email (Newsletters)',
      ok: (emailSubscribers ?? 0) >= 0,
      value: emailSubscribers == null ? '—' : emailSubscribers,
      icon: <Mail className="h-5 w-5" />,
      description: 'Changelog and newsletter subscribers'
    },
    {
      name: 'Push Notifications',
      ok: (pushSubscribers ?? 0) >= 0,
      value: pushSubscribers == null ? '—' : pushSubscribers,
      icon: <Bell className="h-5 w-5" />,
      description: 'Web push subscription count'
    },
    {
      name: 'Realtime presence',
      ok: rtdbConnected ?? false,
      value: rtdbConnected == null ? 'Checking…' : rtdbConnected ? 'Connected' : 'Offline',
      icon: <Wifi className="h-5 w-5" />,
      description: 'Presence and live updates'
    },
    {
      name: 'Active Users',
      ok: (activeUsers ?? 0) >= 0,
      value: activeUsers == null ? '—' : activeUsers,
      icon: <Users className="h-5 w-5" />,
      description: 'Users online (presence)'
    },
    {
      name: 'CourseConnect AI',
      ok: ollamaHealthy ?? false,
      value: ollamaHealthy == null ? 'Checking…' : ollamaHealthy ? 'Available' : 'Unavailable',
      icon: <Cpu className="h-5 w-5" />,
      description: 'AI engine availability'
    },
  ], [apiHealthy, emailSubscribers, pushSubscribers, rtdbConnected, activeUsers, ollamaHealthy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950">
      <Navigation />
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MotionSection className="text-center mb-10">
          <MotionHeadline className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            System Status
          </MotionHeadline>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300"
          >
            Live health across our services.
          </motion.p>
        </MotionSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, idx) => (
            <MotionCard key={s.name} delay={idx * 0.05} className="">
              <Card className="border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <span className={`p-2 rounded-lg ${s.ok ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'}`}>
                      {s.icon}
                    </span>
                    <CardTitle className="text-base font-semibold">{s.name}</CardTitle>
                  </div>
                  <Badge variant={s.ok ? 'secondary' : 'destructive'} className="capitalize">
                    {s.ok ? 'Operational' : 'Issue'}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{s.description}</div>
                    <div className={`flex items-center gap-2 font-medium ${s.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {s.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      <span>{s.value ?? '—'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MotionCard>
          ))}
        </div>

        <MotionSection delay={0.1} className="mt-12">
          <Card className="border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Diagnostics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  APIs: `GET /api/newsletter?email=…` and `GET /api/changelog-email`.
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Push: `GET /api/push-notifications/subscribe`.
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Presence: Firebase RTDB `status/` and `.info/connected`.
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" variant="secondary" onClick={() => window.location.reload()}>
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </MotionSection>
      </main>
      <Footer />
    </div>
  );
}


