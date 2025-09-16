"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Shield, Eye, Lock, Database, UserCheck, Mail, Phone } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

const privacySections = [
  {
    icon: <Database className="h-6 w-6 text-blue-500" />,
    title: "Information We Collect",
    content: [
      "Account information (name, email, university, major)",
      "Academic data (syllabi, assignments, grades)",
      "Usage data (features used, time spent, interactions)",
      "Communication data (messages, study group interactions)",
      "Device information (browser type, IP address, operating system)"
    ]
  },
  {
    icon: <Eye className="h-6 w-6 text-green-500" />,
    title: "How We Use Your Information",
    content: [
      "Provide and improve our educational services",
      "Personalize your learning experience with AI",
      "Connect you with relevant study groups and classmates",
      "Send important updates about your courses and assignments",
      "Analyze usage patterns to enhance platform features"
    ]
  },
  {
    icon: <Shield className="h-6 w-6 text-purple-500" />,
    title: "Data Protection",
    content: [
      "All data is encrypted in transit and at rest",
      "We comply with FERPA (Family Educational Rights and Privacy Act)",
      "Regular security audits and penetration testing",
      "Access controls and authentication measures",
      "Data backup and disaster recovery procedures"
    ]
  },
  {
    icon: <Lock className="h-6 w-6 text-red-500" />,
    title: "Your Rights",
    content: [
      "Access your personal data at any time",
      "Request correction of inaccurate information",
      "Delete your account and associated data",
      "Opt-out of marketing communications",
      "Export your data in a portable format"
    ]
  }
];

const dataSharing = [
  {
    category: "Never Shared",
    items: [
      "Personal academic records",
      "Private study group conversations",
      "Individual grade information",
      "Personal identification details"
    ]
  },
  {
    category: "Shared with Consent",
    items: [
      "Study group participation (with group members)",
      "Public course discussions (anonymized)",
      "Aggregate usage statistics (no personal data)",
      "Research participation (with explicit consent)"
    ]
  }
];

export default function PrivacyPage() {
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

      <main className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            Privacy <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Your privacy is our priority. Learn how we protect and handle your personal information.
          </p>
          <div className="mt-6">
            <Badge variant="outline" className="text-sm">
              Last updated: January 16, 2024
            </Badge>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-4">Our Commitment to Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              At CourseConnect, we understand that your academic data is sensitive and personal. We are committed to protecting your privacy 
              and ensuring that your information is handled with the utmost care and security. This Privacy Policy explains how we collect, 
              use, and protect your information when you use our platform.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Sections */}
        <div className="space-y-8 mb-12">
          {privacySections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Data Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data Sharing and Disclosure</CardTitle>
            <CardDescription>
              We are transparent about when and how we share your information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {dataSharing.map((category, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-3 text-lg">{category.category}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security Measures */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Security Measures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">Technical Safeguards</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• End-to-end encryption for all data transmission</li>
                  <li>• AES-256 encryption for data at rest</li>
                  <li>• Multi-factor authentication for staff access</li>
                  <li>• Regular security audits and penetration testing</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Administrative Safeguards</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Employee training on data protection</li>
                  <li>• Strict access controls and monitoring</li>
                  <li>• Incident response procedures</li>
                  <li>• Regular privacy impact assessments</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Compliance and Regulations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">FERPA Compliance</h4>
                <p className="text-sm text-muted-foreground">
                  We comply with the Family Educational Rights and Privacy Act (FERPA), ensuring that student educational records 
                  are protected and only shared with appropriate parties.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">GDPR Compliance</h4>
                <p className="text-sm text-muted-foreground">
                  For international users, we comply with the General Data Protection Regulation (GDPR), providing enhanced 
                  privacy rights and data protection measures.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">COPPA Compliance</h4>
                <p className="text-sm text-muted-foreground">
                  We do not knowingly collect personal information from children under 13 without parental consent, 
                  in compliance with the Children's Online Privacy Protection Act (COPPA).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Contact Us About Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy or how we handle your data, please contact us:
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">privacy@courseconnect.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Policy Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy 
              Policy periodically for any changes.
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Questions About Privacy?</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                We're here to help clarify any questions you may have about how we protect your data.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg">
                    Contact Us <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    Get Started
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
