import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Briefcase, Trophy, Plus, Trash2, GraduationCap, Calendar, Building, Tag, X } from 'lucide-react';
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
          title: p.title || '',
          company: '', // New field
          startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
          endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '',
          industryKeywords: p.keywords?.join(', ') || '',
          skillsKeywords: '', // New field
          description: p.description || '',
          summary: p.summary || '',
          achievements: p.achievements || '',
          bullets: p.bullets || []
        }))
      : [{
          title: '',
          company: '',
          startDate: '',
          endDate: '',
          industryKeywords: '',
          skillsKeywords: '',
          description: '',
          summary: '',
          achievements: '',
          bullets: []
        }]
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
          keywords: project.industryKeywords ? project.industryKeywords.split(',').map((k: string) => k.trim()) : [],
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
      company: '',
      startDate: '',
      endDate: '',
      industryKeywords: '',
      skillsKeywords: '',
      description: '',
      summary: '',
      achievements: '',
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

  const addKeywordTag = (projectIndex: number, field: 'industryKeywords' | 'skillsKeywords', keyword: string) => {
    if (!keyword.trim()) return;
    
    const project = projects[projectIndex];
    const currentKeywords = project[field] ? project[field].split(',').map((k: string) => k.trim()) : [];
    
    if (!currentKeywords.includes(keyword.trim())) {
      const newKeywords = [...currentKeywords, keyword.trim()].join(', ');
      updateProjectField(projectIndex, field, newKeywords);
    }
  };

  const removeKeywordTag = (projectIndex: number, field: 'industryKeywords' | 'skillsKeywords', keywordToRemove: string) => {
    const project = projects[projectIndex];
    const currentKeywords = project[field] ? project[field].split(',').map((k: string) => k.trim()) : [];
    const newKeywords = currentKeywords.filter(k => k !== keywordToRemove).join(', ');
    updateProjectField(projectIndex, field, newKeywords);
  };

  const renderKeywordTags = (projectIndex: number, field: 'industryKeywords' | 'skillsKeywords', color: string) => {
    const project = projects[projectIndex];
    const keywords = project[field] ? project[field].split(',').map((k: string) => k.trim()).filter(Boolean) : [];
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {keywords.map((keyword, keywordIndex) => (
          <Badge key={keywordIndex} variant="outline" className={`${color} text-xs flex items-center gap-1`}>
            {keyword}
            <button
              type="button"
              onClick={() => removeKeywordTag(projectIndex, field, keyword)}
              className="ml-1 hover:text-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    );
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

      {/* Projects & Work Experience Section */}
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
              <div key={index} className="p-6 border border-gray-200 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Experience {index + 1}
                  </h4>
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

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${index}`} className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Project/Job Title
                    </Label>
                    <Input
                      id={`title-${index}`}
                      value={project.title}
                      onChange={(e) => updateProjectField(index, 'title', e.target.value)}
                      placeholder="e.g., Senior Software Engineer, E-commerce Platform"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`company-${index}`} className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Company/Organization
                    </Label>
                    <Input
                      id={`company-${index}`}
                      value={project.company}
                      onChange={(e) => updateProjectField(index, 'company', e.target.value)}
                      placeholder="e.g., Google, Personal Project, Freelance"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`startDate-${index}`} className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date
                    </Label>
                    <Input
                      id={`startDate-${index}`}
                      type="date"
                      value={project.startDate}
                      onChange={(e) => updateProjectField(index, 'startDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`endDate-${index}`} className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      End Date
                    </Label>
                    <Input
                      id={`endDate-${index}`}
                      type="date"
                      value={project.endDate}
                      onChange={(e) => updateProjectField(index, 'endDate', e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Leave empty if currently ongoing</p>
                  </div>
                </div>

                {/* Keywords Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`industryKeywords-${index}`} className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Industry Keywords
                    </Label>
                    <Input
                      id={`industryKeywords-${index}`}
                      value={project.industryKeywords}
                      onChange={(e) => updateProjectField(index, 'industryKeywords', e.target.value)}
                      placeholder="e.g., FinTech, E-commerce, Healthcare, SaaS"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = e.currentTarget.value.split(',').pop()?.trim();
                          if (value) {
                            addKeywordTag(index, 'industryKeywords', value);
                          }
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500">Press Enter to add tags, comma-separated</p>
                    {renderKeywordTags(index, 'industryKeywords', 'bg-purple-100 text-purple-800')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`skillsKeywords-${index}`} className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Skills Keywords
                    </Label>
                    <Input
                      id={`skillsKeywords-${index}`}
                      value={project.skillsKeywords}
                      onChange={(e) => updateProjectField(index, 'skillsKeywords', e.target.value)}
                      placeholder="e.g., React, Node.js, AWS, Python, Docker"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = e.currentTarget.value.split(',').pop()?.trim();
                          if (value) {
                            addKeywordTag(index, 'skillsKeywords', value);
                          }
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500">Press Enter to add tags, comma-separated</p>
                    {renderKeywordTags(index, 'skillsKeywords', 'bg-blue-100 text-blue-800')}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={project.description}
                    onChange={(e) => updateProjectField(index, 'description', e.target.value)}
                    placeholder="Detailed description of your role, responsibilities, and the project scope..."
                    className="min-h-[120px]"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Recommended: 200-400 words</span>
                    <span>{project.description.length} characters</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <Label htmlFor={`summary-${index}`}>Summary</Label>
                  <Textarea
                    id={`summary-${index}`}
                    value={project.summary}
                    onChange={(e) => updateProjectField(index, 'summary', e.target.value)}
                    placeholder="Brief 2-3 sentence overview for resume use..."
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-gray-500">Concise summary for resume and quick reference</p>
                </div>

                {/* Achievements & Awards */}
                <div className="space-y-2">
                  <Label htmlFor={`achievements-${index}`} className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Achievements & Awards
                  </Label>
                  <Textarea
                    id={`achievements-${index}`}
                    value={project.achievements}
                    onChange={(e) => updateProjectField(index, 'achievements', e.target.value)}
                    placeholder="• Increased system performance by 40%&#10;• Led team of 5 developers&#10;• Reduced deployment time from 2 hours to 15 minutes&#10;• Won 'Innovation Award' for technical excellence"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-gray-500">Use bullet points (•) and include quantifiable results when possible</p>
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
                Add Experience
              </Button>

              <Button 
                type="submit" 
                disabled={updateProjectsMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {updateProjectsMutation.isPending ? 'Updating...' : 'Update Experiences'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
