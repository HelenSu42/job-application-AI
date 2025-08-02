import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Briefcase, Plus, Trash2, Upload } from 'lucide-react';
import backend from '~backend/client';

interface ProjectsFormProps {
  userProfile: any;
}

export default function ProjectsForm({ userProfile }: ProjectsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validProjects = projects.filter(project => project.title);
    updateProjectsMutation.mutate(validProjects);
  };

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

  const handleResumeUpload = () => {
    toast({
      title: "Resume upload",
      description: "Resume parsing feature will be implemented soon.",
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Projects & Experience
        </CardTitle>
        <CardDescription>
          Add your projects, work experience, and achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Upload Resume for AI Parsing</h4>
              <p className="text-sm text-blue-700">
                Upload your resume to automatically extract project information
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleResumeUpload}
              className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <Upload className="w-4 h-4" />
              Upload Resume
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
  );
}
