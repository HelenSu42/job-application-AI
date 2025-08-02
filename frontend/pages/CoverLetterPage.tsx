import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Mail, Download, Eye, Settings } from 'lucide-react';
import backend from '~backend/client';
import { useAuth } from '../contexts/AuthContext';
import CoverLetterPreview from '../components/cover-letter/CoverLetterPreview';
import CoverLetterSuggestions from '../components/cover-letter/CoverLetterSuggestions';

export default function CoverLetterPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tone, setTone] = useState<'formal' | 'conversational' | 'enthusiastic'>('formal');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<any>(null);

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: () => backend.user.get({ id: user!.id }),
    enabled: !!user
  });

  const generateCoverLetterMutation = useMutation({
    mutationFn: async () => {
      if (!userProfile) throw new Error('User profile not loaded');
      
      return backend.resume.generateCoverLetter({
        userProfile: {
          name: userProfile.name,
          email: userProfile.email,
          projects: userProfile.projects,
          skills: userProfile.skills,
          achievements: userProfile.achievements
        },
        jobDescription,
        companyName: companyName || undefined,
        tone
      });
    },
    onSuccess: (coverLetter) => {
      setGeneratedCoverLetter(coverLetter);
      toast({
        title: "Cover letter generated!",
        description: "Your personalized cover letter is ready for review.",
      });
    },
    onError: (error) => {
      console.error('Cover letter generation error:', error);
      toast({
        title: "Failed to generate cover letter",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  });

  const handleGenerateCoverLetter = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Missing job description",
        description: "Please provide a job description to generate a tailored cover letter.",
        variant: "destructive",
      });
      return;
    }
    generateCoverLetterMutation.mutate();
  };

  const handleDownload = (format: 'pdf' | 'word') => {
    // Mock download functionality
    toast({
      title: `Downloading ${format.toUpperCase()}`,
      description: "Your cover letter download will begin shortly.",
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
          <Link to="/resume" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resume Builder
          </Link>
        </div>

        <div className="mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-6 h-6 text-blue-600" />
                Cover Letter Generator
              </CardTitle>
              <CardDescription className="text-gray-600">
                Create a compelling cover letter tailored to the specific job and company
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
                  Letter Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="e.g., Google, Microsoft"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Writing Tone</Label>
                  <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description *</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the complete job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[150px] resize-none"
                    required
                  />
                </div>

                <Button 
                  onClick={handleGenerateCoverLetter}
                  disabled={generateCoverLetterMutation.isPending || !jobDescription.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {generateCoverLetterMutation.isPending ? 'Generating...' : 'Generate Cover Letter'}
                </Button>

                {generatedCoverLetter && (
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

            {generatedCoverLetter && (
              <CoverLetterSuggestions 
                suggestions={generatedCoverLetter.suggestions}
                keywordMatches={generatedCoverLetter.keywordMatches}
              />
            )}
          </div>

          {/* Cover Letter Preview */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Cover Letter Preview
                </CardTitle>
                <CardDescription>
                  Professional format preview of your cover letter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CoverLetterPreview 
                  coverLetter={generatedCoverLetter}
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
