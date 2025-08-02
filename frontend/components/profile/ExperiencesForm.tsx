import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Briefcase, Trophy, Plus, Trash2, GraduationCap } from 'lucide-react';
import backend from '~backend/client';

interface ExperiencesFormProps {
  userProfile: any;
}

export default function ExperiencesForm({ userProfile }: ExperiencesFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [education, setEducation] = useState(
    userProfile.education?.length > 0 
      ? userProfile.education.map((edu: any) => ({
          ...edu,
          graduationDate: edu.graduationDate ? new Date(edu.graduationDate).toISOString().split('T')[0] : ''
        }))
      : [{ institution: '', degree: '', graduationDate: '' }]
  );

  const [projects, setProjects] = useState(
    userProfile.projects?.length > 0 
      ? userProfile.projects.map((p: any) => ({
          ...p,
          startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
          endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '',
          keywords: p.keywords?.join(', ') || '',
          bullets: p.bullets || []
        }))
      : [{
          title: '',
          description: '',
          summary: '',
          keywords: '',
          startDate: '',
          endDate: '',
          bullets: []
        }]
  );

  const [achievements, setAchievements] = useState(
    userProfile.achievements?.length > 0 
      ? userProfile.achievements.map((a: any) => ({
          ...a,
          dateReceived: a.dateReceived ? new Date(a.dateReceived).toISOString().split('T')[0] : ''
        }))
      : [{ title: '', description: '', dateReceived: '' }]
  );

  const updateEducationMutation = useMutation({
    mutationFn: async (educationData: any[]) => {
      return backend.user.updateEducation({
        userId: userProfile.id,
        education: educationData.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          graduationDate: edu.graduationDate ? new Date(edu.graduationDate) : undefined
        }))
      });
    },
    onSuccess: () => {
      toast({
        title: "Education updated",
        description: "Your education information has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['user', userProfile.id] });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "Update failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  });

  const updateProjectsMutation = useMutation({
    mutationFn: async (projectsData: any[]) => {
      return backend.user.updateProjects({
        userId: userProfile.id,
        projects: projectsData.map(project => ({
          title: project.title,
          description: project.description,
          summary: project.summary,
          keywords: project.keywords ? project.keywords.split(',').map((k: string) => k.trim()) : [],
          startDate: project.startDate ? new Date(project.startDate) : undefined,
          endDate: project.endDate ? new Date(project.endDate) : undefined,
          bullets: project.bullets || []
        }))
      });
    },
    onSuccess: () => {
      toast({
        title: "Projects updated",
        description: "Your project information has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['user', userProfile.id] });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "Update failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  });

  const updateAchievementsMutation = useMutation({
    mutationFn: async (achievementsData: any[]) => {
      return backend.user.updateAchievements({
        userId: userProfile.id,
        achievements: achievementsData.map(achievement => ({
          title: achievement.title,
          description: achievement.description,
          dateReceived: achievement.dateReceived ? new Date(achievement.dateReceived) : undefined
        }))
      });
    },
    onSuccess: () => {
      toast({
        title: "Achievements updated",
        description: "Your achievements have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['user', userProfile.id] });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "Update failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  });

  const handleEducationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validEducation = education.filter(edu => edu.institution && edu.degree);
    updateEducationMutation.mutate(validEducation);
  };

  const handleProjectsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validProjects = projects.filter(project => project.title);
    updateProjectsMutation.mutate(validProjects);
  };

  const handleAchievementsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validAchievements = achievements.filter(achievement => achievement.title);
    updateAchievementsMutation.mutate(validAchievements);
  };

  // Education handlers
  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', graduationDate: '' }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducationField = (index: number, field: string, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  // Project handlers
  const addProject = () => {
    setProjects([...projects, {
      title: '',
      description: '',
      summary: '',
      keywords: '',
      startDate: '',
      endDate: '',
      bullets: []
    }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProjectField = (index: number, field: string, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  // Achievement handlers
  const addAchievement = () => {
    setAchievements([...achievements, { title: '', description: '', dateReceived: '' }]);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const updateAchievementField = (index: number, field: string, value: string) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  return (
    <div className="space-y-8">
      {/* Education Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Education
          </CardTitle>
          <CardDescription>
            Add your educational background and qualifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEducationSubmit} className="space-y-6">
            {education.map((edu, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                  {education.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEducation(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`institution-${index}`}>Institution</Label>
                    <Input
                      id={`institution-${index}`}
                      value={edu.institution}
                      onChange={(e) => updateEducationField(index, 'institution', e.target.value)}
                      placeholder="University name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`degree-${index}`}>Degree</Label>
                    <Input
                      id={`degree-${index}`}
                      value={edu.degree}
                      onChange={(e) => updateEducationField(index, 'degree', e.target.value)}
                      placeholder="Bachelor of Science in Computer Science"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`graduationDate-${index}`}>Graduation Date</Label>
                    <Input
                      id={`graduationDate-${index}`}
                      type="date"
                      value={edu.graduationDate}
                      onChange={(e) => updateEducationField(index, 'graduationDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={addEducation}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Education
              </Button>

              <Button 
                type="submit" 
                disabled={updateEducationMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {updateEducationMutation.isPending ? 'Updating...' : 'Update Education'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Projects Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            Projects & Work Experience
          </CardTitle>
          <CardDescription>
            Add your projects, work experience, and professional accomplishments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProjectsSubmit} className="space-y-6">
            {projects.map((project, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Project {index + 1}</h4>
                  {projects.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProject(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${index}`}>Project Title</Label>
                    <Input
                      id={`title-${index}`}
                      value={project.title}
                      onChange={(e) => updateProjectField(index, 'title', e.target.value)}
                      placeholder="e.g., E-commerce Platform"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`keywords-${index}`}>Keywords</Label>
                    <Input
                      id={`keywords-${index}`}
                      value={project.keywords}
                      onChange={(e) => updateProjectField(index, 'keywords', e.target.value)}
                      placeholder="React, Node.js, MongoDB (comma-separated)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                    <Input
                      id={`startDate-${index}`}
                      type="date"
                      value={project.startDate}
                      onChange={(e) => updateProjectField(index, 'startDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`endDate-${index}`}>End Date</Label>
                    <Input
                      id={`endDate-${index}`}
                      type="date"
                      value={project.endDate}
                      onChange={(e) => updateProjectField(index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={project.description}
                    onChange={(e) => updateProjectField(index, 'description', e.target.value)}
                    placeholder="Detailed description of the project..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`summary-${index}`}>Summary</Label>
                  <Textarea
                    id={`summary-${index}`}
                    value={project.summary}
                    onChange={(e) => updateProjectField(index, 'summary', e.target.value)}
                    placeholder="Brief summary for resume use..."
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={addProject}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </Button>

              <Button 
                type="submit" 
                disabled={updateProjectsMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {updateProjectsMutation.isPending ? 'Updating...' : 'Update Projects'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-600" />
            Achievements & Awards
          </CardTitle>
          <CardDescription>
            Add your professional achievements, awards, and recognitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAchievementsSubmit} className="space-y-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Achievement {index + 1}</h4>
                  {achievements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAchievement(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`achievementTitle-${index}`}>Achievement Title</Label>
                    <Input
                      id={`achievementTitle-${index}`}
                      value={achievement.title}
                      onChange={(e) => updateAchievementField(index, 'title', e.target.value)}
                      placeholder="e.g., Employee of the Year, Dean's List"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`dateReceived-${index}`}>Date Received</Label>
                    <Input
                      id={`dateReceived-${index}`}
                      type="date"
                      value={achievement.dateReceived}
                      onChange={(e) => updateAchievementField(index, 'dateReceived', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`achievementDescription-${index}`}>Description</Label>
                  <Textarea
                    id={`achievementDescription-${index}`}
                    value={achievement.description}
                    onChange={(e) => updateAchievementField(index, 'description', e.target.value)}
                    placeholder="Brief description of the achievement..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={addAchievement}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Achievement
              </Button>

              <Button 
                type="submit" 
                disabled={updateAchievementsMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {updateAchievementsMutation.isPending ? 'Updating...' : 'Update Achievements'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
