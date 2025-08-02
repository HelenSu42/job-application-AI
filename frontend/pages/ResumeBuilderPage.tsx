import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, FileText, Download, Eye, Settings } from 'lucide-react';
import backend from '~backend/client';
import { useAuth } from '../contexts/AuthContext';
import ResumePreview from '../components/resume/ResumePreview';
import SectionCustomizer from '../components/resume/SectionCustomizer';
import OptimizationSuggestions from '../components/resume/OptimizationSuggestions';

export default function ResumeBuilderPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const [generatedResume, setGeneratedResume] = useState<any>(null);
  const [selectedSections, setSelectedSections] = useState([
    { type: 'contact', order: 1 },
    { type: 'education', order: 2 },
    { type: 'projects', order: 3 },
    { type: 'skills', order: 4 },
    { type: 'languages', order: 5 }
  ]);

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => backend.user.get({ id: user!.id }),
    enabled: !!user
  });

  const generateResumeMutation = useMutation({
    mutationFn: async () => {
      if (!userProfile) throw new Error('User profile not loaded');
      
      return backend.resume.generate({
        userProfile: {
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
          location: userProfile.location,
          education: userProfile.education,
          skills: userProfile.skills,
          languages: userProfile.languages,
          projects: userProfile.projects,
          achievements: userProfile.achievements
        },
        jobDescription: jobDescription || undefined,
        template: selectedTemplate,
        selectedSections
      });
    },
    onSuccess: (resume) => {
      setGeneratedResume(resume);
      toast({
        title: "Resume generated!",
        description: "Your customized resume is ready for review.",
      });
    },
    onError: (error) => {
      console.error('Resume generation error:', error);
      toast({
        title: "Failed to generate resume",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  });

  const handleGenerateResume = () => {
    generateResumeMutation.mutate();
  };

  const handleDownload = (format: 'pdf' | 'word') => {
    // Mock download functionality
    toast({
      title: `Downloading ${format.toUpperCase()}`,
      description: "Your resume download will begin shortly.",
    });
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/profile" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
          <Link to="/cover-letter">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Generate Cover Letter
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Resume Builder
              </CardTitle>
              <CardDescription className="text-gray-600">
                Create a professional, ATS-friendly resume tailored to your target job
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Resume Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Template Style</Label>
                  <Select value={selectedTemplate} onValueChange={(value: any) => setSelectedTemplate(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste job description for keyword optimization..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  <p className="text-xs text-gray-500">
                    Adding a job description helps optimize keywords and content
                  </p>
                </div>

                <Button 
                  onClick={handleGenerateResume}
                  disabled={generateResumeMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {generateResumeMutation.isPending ? 'Generating...' : 'Generate Resume'}
                </Button>

                {generatedResume && (
                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleDownload('pdf')}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button 
                      onClick={() => handleDownload('word')}
                      variant="outline"
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Word
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <SectionCustomizer 
              sections={selectedSections}
              onSectionsChange={setSelectedSections}
            />

            {generatedResume && (
              <OptimizationSuggestions 
                suggestions={generatedResume.optimizationSuggestions}
                atsScore={generatedResume.atsScore}
              />
            )}
          </div>

          {/* Resume Preview */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Resume Preview
                </CardTitle>
                <CardDescription>
                  A4 format preview of your resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumePreview 
                  resume={generatedResume}
                  template={selectedTemplate}
                  userProfile={userProfile}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
