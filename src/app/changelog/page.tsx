"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  CheckCircle, 
  History,
  Search,
  Filter,
  Download,
  ExternalLink,
  Sparkles,
  Bug,
  Shield,
  Zap,
  Rocket
} from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { getSiteLogsForDisplay, SiteLogManager } from "@/lib/site-logs";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { MotionHeadline, MotionCard, MotionSection } from "@/components/ui/motion-section";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ChangelogPage() {
  const siteLogs = getSiteLogsForDisplay();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterImpact, setFilterImpact] = useState<string>("all");

  const filteredLogs = useMemo(() => {
    return siteLogs.filter(log => {
      const matchesSearch = log.changes.some(change => 
        change.toLowerCase().includes(searchTerm.toLowerCase())
      ) || log.version.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "all" || log.type === filterType;
      const matchesImpact = filterImpact === "all" || log.impact === filterImpact;
      
      return matchesSearch && matchesType && matchesImpact;
    });
  }, [siteLogs, searchTerm, filterType, filterImpact]);

  // Get user-facing stats only
  const userFacingStats = useMemo(() => {
    const userFacingLogs = siteLogs.filter(log => 
      ['launch', 'feature', 'enhancement', 'bug-fix', 'security', 'performance'].includes(log.type)
    );
    
    const byType = userFacingLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byImpact = userFacingLogs.reduce((acc, log) => {
      acc[log.impact || 'medium'] = (acc[log.impact || 'medium'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs: userFacingLogs.length,
      byType,
      byImpact,
      latestVersion: userFacingLogs[0]?.version || 'v1.0.0'
    };
  }, [siteLogs]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'launch': return <Rocket className="h-4 w-4" />;
      case 'feature': return <Sparkles className="h-4 w-4" />;
      case 'enhancement': return <Zap className="h-4 w-4" />;
      case 'bug-fix': return <Bug className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'launch': return 'bg-green-500';
      case 'feature': return 'bg-blue-500';
      case 'enhancement': return 'bg-purple-500';
      case 'bug-fix': return 'bg-red-500';
      case 'security': return 'bg-orange-500';
      case 'performance': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Use filtered stats instead of all stats

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 sm:h-20 max-w-6xl mx-auto px-3 sm:px-6 items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary tracking-tight">CourseConnect</h1>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            <Link href="/home" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <MotionSection className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <div className="p-4 rounded-full bg-primary/10">
              <History className="h-12 w-12 text-primary" />
            </div>
          </motion.div>
          <MotionHeadline className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            Site Updates & <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Changelog</span>
          </MotionHeadline>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6"
          >
            User-focused updates, new features, and improvements to CourseConnect.
            <span className="text-sm text-muted-foreground/70 block mt-2">
              Only showing changes that directly impact your experience.
            </span>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Calendar className="h-3 w-3 mr-1" />
              {userFacingStats.totalLogs} User Updates
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Rocket className="h-3 w-3 mr-1" />
              Latest: {userFacingStats.latestVersion}
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              <Clock className="h-3 w-3 mr-1" />
              Updated Daily
            </Badge>
          </motion.div>
        </MotionSection>

        {/* Search and Filters */}
        <MotionCard delay={0.05}>
        <Card className="mb-8 border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search updates, versions, or features..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="launch">🚀 Launch</SelectItem>
                    <SelectItem value="feature">✨ Feature</SelectItem>
                    <SelectItem value="enhancement">🔧 Enhancement</SelectItem>
                    <SelectItem value="bug-fix">🐛 Bug Fix</SelectItem>
                    <SelectItem value="security">🔒 Security</SelectItem>
                    <SelectItem value="performance">⚡ Performance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterImpact} onValueChange={setFilterImpact}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Impact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Impact</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        </MotionCard>

        {/* Changelog Entries */}
        <div className="space-y-6 mb-12">
          {filteredLogs.map((log, index) => (
            <MotionCard key={index} delay={0.06 + index * 0.03}>
            <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.01] sm:hover:scale-[1.02] border border-gray-200/60 dark:border-gray-800/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge 
                      variant={
                        log.type === 'launch' ? 'default' :
                        log.type === 'feature' ? 'secondary' :
                        log.type === 'enhancement' ? 'outline' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {getTypeIcon(log.type)}
                      <span className="ml-1">
                        {log.type === 'launch' ? 'Launch' :
                         log.type === 'feature' ? 'Feature' :
                         log.type === 'enhancement' ? 'Enhancement' : 
                         log.type === 'security' ? 'Security' :
                         log.type === 'performance' ? 'Performance' : 'Bug Fix'}
                      </span>
                    </Badge>
                    {log.impact && (
                      <Badge variant="outline" className="text-xs">
                        {log.impact === 'critical' ? '🔴 Critical' :
                         log.impact === 'high' ? '🟠 High' :
                         log.impact === 'medium' ? '🟡 Medium' : '🟢 Low'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {log.date}
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span>{log.version}</span>
                  {log.author && (
                    <span className="text-sm font-normal text-muted-foreground">
                      by {log.author}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {log.changes.map((change, changeIndex) => (
                    <motion.li
                      key={changeIndex}
                      initial={{ opacity: 0, x: -6 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.3, delay: changeIndex * 0.03 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{change}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            </MotionCard>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex justify-center mb-4">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No updates found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterImpact("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Stay Updated</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Want to be notified about new features and updates? Subscribe to our newsletter 
                or follow us on social media for the latest CourseConnect news.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/newsletter">
                  <Button size="lg">
                    Subscribe to Updates <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Suggest a Feature
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Stats */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">{userFacingStats.totalLogs}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">User Updates</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-500">{userFacingStats.byType.feature || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">New Features</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-500">{userFacingStats.byType['bug-fix'] || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Bug Fixes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-500">{userFacingStats.byType.enhancement || 0}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Enhancements</div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
