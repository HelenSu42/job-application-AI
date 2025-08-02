import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, User, Briefcase, Code, LogOut, CheckCircle, AlertTriangle, Edit, Circle } from 'lucide-react';
import backend from '~backend/client';
import { useAuth } from '../contexts/AuthContext';
import PersonalInfoForm from '../components/profile/PersonalInfoForm';
import SkillsLanguagesForm from '../components/profile/SkillsLanguagesForm';
import ExperiencesForm from '../components/profile/ExperiencesForm';
import ResumeUploadForm from '../components/profile/ResumeUploadForm';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');

  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => backend.user.get({ id: user!.id }),
    enabled: !!user
  });

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <p className="text-red-600 mb-4">Failed to load profile</p>
            <Link to="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionPercentage = calculateProfileCompletion(userProfile);
  const tabStatuses = getTabStatuses(userProfile);

  const tabs = [
    { id: 'upload', label: 'Resume Upload', icon: Upload, status: tabStatuses.upload },
    { id: 'personal', label: 'Personal Info', icon: User, status: tabStatuses.personal },
    { id: 'experiences', label: 'Experiences', icon: Briefcase, status: tabStatuses.experiences },
    { id: 'skills', label: 'Skills & Languages', icon: Code, status: tabStatuses.skills }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'incomplete':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'in-progress':
        return <Edit className="w-4 h-4 text-blue-600" />;
      case 'empty':
        return <Circle className="w-4 h-4 text-gray-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'empty':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'incomplete':
        return 'Incomplete';
      case 'in-progress':
        return 'In Progress';
      case 'empty':
        return 'Empty';
      default:
        return 'Empty';
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/analysis">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Analyze Job Opportunities
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Welcome, {userProfile.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Complete your profile to get personalized job recommendations
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={completionPercentage} className="h-2" />
              </div>
            </CardHeader>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border shadow-sm h-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-2 py-4 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 rounded-lg relative"
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="w-5 h-5" />
                  {getStatusIcon(tab.status)}
                </div>
                <span className="text-sm font-medium">{tab.label}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(tab.status)}`}
                >
                  {getStatusText(tab.status)}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <ResumeUploadForm userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="personal" className="mt-6">
            <PersonalInfoForm userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="experiences" className="mt-6">
            <ExperiencesForm userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="skills" className="mt-6">
            <SkillsLanguagesForm userProfile={userProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function calculateProfileCompletion(profile: any): number {
  let completed = 0;
  let total = 4;

  // Personal info (always has basic info since it's required)
  completed += 1;

  // Skills & Languages
  if ((profile.skills && profile.skills.length > 0) || (profile.languages && profile.languages.length > 0)) {
    completed += 1;
  }

  // Experiences (projects or achievements)
  if ((profile.projects && profile.projects.length > 0) || (profile.achievements && profile.achievements.length > 0)) {
    completed += 1;
  }

  // Education
  if (profile.education && profile.education.length > 0) {
    completed += 1;
  }

  return Math.round((completed / total) * 100);
}

function getTabStatuses(profile: any) {
  return {
    upload: 'empty', // Always empty since we don't store uploaded files
    personal: profile.name && profile.email ? 'complete' : 'incomplete',
    experiences: (profile.projects && profile.projects.length > 0) || (profile.education && profile.education.length > 0) 
      ? 'complete' 
      : profile.projects?.length > 0 || profile.education?.length > 0 
        ? 'in-progress' 
        : 'empty',
    skills: (profile.skills && profile.skills.length > 0) || (profile.languages && profile.languages.length > 0)
      ? 'complete'
      : profile.skills?.length > 0 || profile.languages?.length > 0
        ? 'in-progress'
        : 'empty'
  };
}
