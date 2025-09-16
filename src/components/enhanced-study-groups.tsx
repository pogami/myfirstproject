'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Plus, 
  Search, 
  Calendar, 
  Video, 
  MessageSquare, 
  Share2, 
  Settings,
  Crown,
  Clock,
  MapPin,
  BookOpen,
  Target,
  Zap,
  Heart,
  Star,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  ScreenShare,
  Hand,
  ThumbsUp,
  Send,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudyGroup {
  id: string;
  name: string;
  course: string;
  description: string;
  members: GroupMember[];
  maxMembers: number;
  isPublic: boolean;
  tags: string[];
  nextMeeting?: StudySession;
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  isOnline: boolean;
  studyStreak: number;
  contributionScore: number;
}

interface StudySession {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  isVirtual: boolean;
  meetingLink?: string;
  agenda: string[];
  attendees: string[];
  materials: SessionMaterial[];
}

interface SessionMaterial {
  id: string;
  name: string;
  type: 'document' | 'video' | 'link' | 'quiz';
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

interface EnhancedStudyGroupsProps {
  userId?: string;
  userCourses?: string[];
}

export function EnhancedStudyGroups({ userId, userCourses = [] }: EnhancedStudyGroupsProps) {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInSession, setIsInSession] = useState(false);
  const [sessionMembers, setSessionMembers] = useState<GroupMember[]>([]);
  const { toast } = useToast();

  // Mock data for demonstration
  const mockStudyGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'CS-101 Study Squad',
      course: 'CS-101',
      description: 'Collaborative study group for Introduction to Computer Science',
      members: [
        {
          id: '1',
          name: 'Alex Chen',
          role: 'admin',
          joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          isOnline: true,
          studyStreak: 15,
          contributionScore: 95
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          role: 'moderator',
          joinedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          isOnline: true,
          studyStreak: 12,
          contributionScore: 88
        },
        {
          id: '3',
          name: 'Mike Rodriguez',
          role: 'member',
          joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          isOnline: false,
          studyStreak: 8,
          contributionScore: 72
        }
      ],
      maxMembers: 8,
      isPublic: true,
      tags: ['programming', 'algorithms', 'data-structures'],
      nextMeeting: {
        id: '1',
        title: 'Data Structures Review',
        description: 'Reviewing linked lists, stacks, and queues',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        location: 'Library Study Room 3A',
        isVirtual: false,
        agenda: ['Linked Lists', 'Stack Operations', 'Queue Implementation', 'Practice Problems'],
        attendees: ['1', '2', '3'],
        materials: [
          {
            id: '1',
            name: 'Data Structures Cheat Sheet',
            type: 'document',
            url: '/materials/ds-cheatsheet.pdf',
            uploadedBy: 'Alex Chen',
            uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      createdBy: 'Alex Chen',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      id: '2',
      name: 'Math Warriors',
      course: 'MATH-201',
      description: 'Calculus study group with weekly problem-solving sessions',
      members: [
        {
          id: '4',
          name: 'Emma Wilson',
          role: 'admin',
          joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          isOnline: true,
          studyStreak: 20,
          contributionScore: 98
        },
        {
          id: '5',
          name: 'David Kim',
          role: 'member',
          joinedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          isOnline: true,
          studyStreak: 10,
          contributionScore: 85
        }
      ],
      maxMembers: 6,
      isPublic: true,
      tags: ['calculus', 'derivatives', 'integrals'],
      createdBy: 'Emma Wilson',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  ];

  useEffect(() => {
    setStudyGroups(mockStudyGroups);
    if (mockStudyGroups.length > 0) {
      setSelectedGroup(mockStudyGroups[0]);
    }
  }, []);

  const createStudyGroup = () => {
    setIsCreatingGroup(true);
    toast({
      title: "Creating Study Group",
      description: "Setting up your new study group...",
    });
    
    // Simulate group creation
    setTimeout(() => {
      setIsCreatingGroup(false);
      toast({
        title: "Study Group Created!",
        description: "Your new study group is ready for members.",
      });
    }, 2000);
  };

  const joinStudyGroup = (groupId: string) => {
    toast({
      title: "Joined Study Group!",
      description: "You're now a member of this study group.",
    });
  };

  const startStudySession = () => {
    setIsInSession(true);
    setSessionMembers(selectedGroup?.members.filter(m => m.isOnline) || []);
    toast({
      title: "Study Session Started",
      description: "Virtual study room is now active.",
    });
  };

  const endStudySession = () => {
    setIsInSession(false);
    toast({
      title: "Study Session Ended",
      description: "Session has been saved and recorded.",
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator': return <Star className="h-4 w-4 text-blue-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getContributionColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredGroups = studyGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Study Groups</h2>
          <p className="text-muted-foreground">Connect with classmates and study together</p>
        </div>
        <Button onClick={createStudyGroup} disabled={isCreatingGroup}>
          {isCreatingGroup ? (
            <>
              <Plus className="h-4 w-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </>
          )}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search study groups by name, course, or topic..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Study Groups Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map((group) => (
          <Card
            key={group.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedGroup?.id === group.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedGroup(group)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <Badge variant="outline">{group.course}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {group.members.length}/{group.maxMembers} members
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {group.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {group.nextMeeting && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Next: {group.nextMeeting.title}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View
                </Button>
                <Button size="sm" className="flex-1">
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Group Details */}
      {selectedGroup && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Group Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {selectedGroup.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Members ({selectedGroup.members.length})</h4>
                <div className="space-y-2">
                  {selectedGroup.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{member.name}</span>
                            {getRoleIcon(member.role)}
                            {member.isOnline && (
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.studyStreak} day streak
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getContributionColor(member.contributionScore)}`}>
                          {member.contributionScore}
                        </div>
                        <div className="text-xs text-muted-foreground">score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={startStudySession}>
                  <Video className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Next Meeting */}
          {selectedGroup.nextMeeting && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Next Study Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">{selectedGroup.nextMeeting.title}</h4>
                  <p className="text-sm text-muted-foreground">{selectedGroup.nextMeeting.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedGroup.nextMeeting.startTime.toLocaleDateString()} at{' '}
                      {selectedGroup.nextMeeting.startTime.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedGroup.nextMeeting.location}</span>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">Agenda</h5>
                  <ul className="space-y-1">
                    {selectedGroup.nextMeeting.agenda.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">Materials</h5>
                  <div className="space-y-1">
                    {selectedGroup.nextMeeting.materials.map((material) => (
                      <div key={material.id} className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{material.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {material.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Virtual Study Session */}
      {isInSession && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Live Study Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Video Grid */}
              <div className="space-y-2">
                <h4 className="font-medium">Participants ({sessionMembers.length})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {sessionMembers.map((member) => (
                    <div key={member.id} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Avatar className="h-8 w-8 mx-auto mb-2">
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-xs">{member.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Controls */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4 mr-2" />
                    Mute
                  </Button>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Video
                  </Button>
                  <Button variant="outline" size="sm">
                    <ScreenShare className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Hand className="h-4 w-4 mr-2" />
                    Raise Hand
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    React
                  </Button>
                </div>

                <Button 
                  variant="destructive" 
                  onClick={endStudySession}
                  className="w-full"
                >
                  End Session
                </Button>
              </div>
            </div>

            {/* Chat */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Session Chat</h4>
              <div className="h-32 overflow-y-auto border rounded p-2 mb-2 bg-muted/20">
                <div className="text-sm text-muted-foreground">
                  Session chat will appear here...
                </div>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Type a message..." className="flex-1" />
                <Button size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
