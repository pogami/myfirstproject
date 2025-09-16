"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, FileText, Scale, Shield, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

const termsSections = [
  {
    icon: <Users className="h-6 w-6 text-blue-500" />,
    title: "Acceptance of Terms",
    content: [
      "By accessing or using CourseConnect, you agree to be bound by these Terms of Service",
      "If you disagree with any part of these terms, you may not access the service",
      "These terms apply to all users, including students, educators, and administrators",
      "We reserve the right to update these terms at any time with notice to users"
    ]
  },
  {
    icon: <Shield className="h-6 w-6 text-green-500" />,
    title: "User Responsibilities",
    content: [
      "Provide accurate and complete information when creating your account",
      "Maintain the security of your account credentials",
      "Use the platform in accordance with your institution's academic integrity policies",
      "Respect other users and maintain appropriate conduct in study groups",
      "Report any violations or inappropriate behavior to our support team"
    ]
  },
  {
    icon: <FileText className="h-6 w-6 text-purple-500" />,
    title: "Academic Integrity",
    content: [
      "CourseConnect is designed to support learning, not replace it",
      "Users must comply with their institution's academic integrity policies",
      "AI assistance should be used as a learning tool, not for cheating",
      "Users are responsible for ensuring their work meets academic standards",
      "We reserve the right to report violations to educational institutions"
    ]
  },
  {
    icon: <Scale className="h-6 w-6 text-red-500" />,
    title: "Limitations and Disclaimers",
    content: [
      "CourseConnect is provided 'as is' without warranties of any kind",
      "We do not guarantee specific academic outcomes or grade improvements",
      "Users are responsible for verifying the accuracy of AI-generated content",
      "We are not liable for any academic consequences resulting from platform use",
      "Service availability may be subject to maintenance and technical issues"
    ]
  }
];

const prohibitedUses = [
  "Violating any academic integrity policies or cheating",
  "Harassing, threatening, or intimidating other users",
  "Sharing inappropriate, offensive, or illegal content",
  "Attempting to gain unauthorized access to the platform",
  "Using the service for commercial purposes without permission",
  "Reverse engineering or attempting to extract source code",
  "Creating multiple accounts to circumvent restrictions"
];

const accountTermination = [
  "Immediate termination for violations of these terms",
  "Suspension for repeated minor violations",
  "Account closure for inactivity after 12 months",
  "Right to terminate accounts that pose security risks",
  "Users may request account deletion at any time",
  "Data retention policies apply after account termination"
];

export default function TermsPage() {
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
        {/* Development Disclaimer */}
        <Card className="mb-8 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Development Demo Notice</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                  <strong>This is a development demonstration project.</strong> CourseConnect is not a commercial business or service. 
                  This Terms of Service document is for educational and portfolio purposes only. The platform can be used for academic work, 
                  but please verify any AI-generated content for accuracy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10">
              <FileText className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
            Terms of <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Service</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Please read these terms carefully before using CourseConnect. By using our service, you agree to these terms.
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
            <h2 className="text-xl font-semibold mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service ("Terms") govern your use of CourseConnect's educational platform and services. 
              By accessing or using our platform, you agree to be bound by these terms and our Privacy Policy. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-8 mb-12">
          {termsSections.map((section, index) => (
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

        {/* Prohibited Uses */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Prohibited Uses
            </CardTitle>
            <CardDescription>
              The following activities are strictly prohibited on our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {prohibitedUses.map((use, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{use}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Account Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Account Termination</CardTitle>
            <CardDescription>
              We reserve the right to terminate accounts under certain circumstances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {accountTermination.map((term, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{term}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Our Content</h4>
              <p className="text-sm text-muted-foreground">
                CourseConnect and its original content, features, and functionality are created for educational and portfolio demonstration purposes. 
                This project showcases web development skills and is not intended for commercial use.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">User Content</h4>
              <p className="text-sm text-muted-foreground">
                You retain ownership of content you upload to CourseConnect. By uploading content, you grant us 
                a license to use, store, and process your content to provide our services. You are responsible 
                for ensuring you have the right to share any content you upload.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              In no event shall CourseConnect, its officers, directors, employees, or agents be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including without limitation, loss of profits, 
              data, use, goodwill, or other intangible losses, resulting from your use of the service.
            </p>
            <p className="text-muted-foreground">
              Our total liability to you for any damages arising from or related to these terms or the service 
              shall not exceed the amount you paid us for the service in the 12 months preceding the claim.
            </p>
          </CardContent>
        </Card>

        {/* Governing Law */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Governing Law and Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Governing Law</h4>
                <p className="text-sm text-muted-foreground">
                  These terms shall be governed by and construed in accordance with the laws of the State of California, 
                  without regard to its conflict of law provisions.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Dispute Resolution</h4>
                <p className="text-sm text-muted-foreground">
                  Any disputes arising from these terms or your use of the service shall be resolved through binding 
                  arbitration in accordance with the rules of the American Arbitration Association.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We reserve the right to modify or replace these Terms of Service at any time. If a revision is material, 
              we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes 
              a material change will be determined at our sole discretion.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This is a development demonstration project. For questions about this demo or portfolio piece, please contact the developer.
            </p>
            <div className="space-y-2">
              <p className="font-medium">Development Project</p>
              <p className="text-sm text-muted-foreground">
                This CourseConnect platform is created for educational and portfolio demonstration purposes.<br />
                The platform can be used for academic work, but is not a commercial business.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                By using CourseConnect, you agree to these terms. Start your educational journey today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg">
                    Accept Terms & Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/privacy">
                  <Button variant="outline" size="lg">
                    Read Privacy Policy
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
