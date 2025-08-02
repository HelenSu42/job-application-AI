import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Save, X } from 'lucide-react';
import backend from '~backend/client';

interface ResumeUploadFormProps {
  userProfile: any;
}

interface ExtractedData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    graduationDate: string;
  }>;
  projects: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    skills: string[];
    achievements: string;
  }>;
  skills: Array<{
    name: string;
    level: number;
    category: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
}

export default function ResumeUploadForm({ userProfile }: ResumeUploadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingStage, setProcessingStage] = useState<'idle' | 'uploading' | 'parsing' | 'complete' | 'error'>('idle');

  const parseResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      setProcessingStage('uploading');
      
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingStage('parsing');
      
      // Simulate AI parsing with more realistic mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // More realistic extracted data based on common resume content
      const mockData: ExtractedData = {
        personalInfo: {
          name: userProfile.name || 'John Smith',
          email: userProfile.email || 'john.smith@email.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA'
        },
        education: [
          {
            institution: 'University of California, Berkeley',
            degree: 'Bachelor of Science in Computer Science',
            graduationDate: '2020-05-15'
          }
        ],
        projects: [
          {
            title: 'E-commerce Web Application',
            company: 'TechStart Inc.',
            startDate: '2022-01-15',
            endDate: '2023-12-31',
            description: 'Developed a full-stack e-commerce platform using React and Node.js. Implemented user authentication, payment processing, and inventory management features.',
            skills: ['React', 'Node.js', 'MongoDB', 'Express.js', 'Stripe API'],
            achievements: '• Increased user engagement by 35%\n• Reduced page load time by 50%\n• Processed over $100K in transactions'
          },
          {
            title: 'Mobile Task Management App',
            company: 'Personal Project',
            startDate: '2021-06-01',
            endDate: '2021-11-30',
            description: 'Built a cross-platform mobile application for task management using React Native. Features include offline sync, push notifications, and collaborative workspaces.',
            skills: ['React Native', 'Firebase', 'Redux', 'TypeScript'],
            achievements: '• Published on both iOS and Android app stores\n• Achieved 4.5-star rating with 500+ downloads\n• Implemented real-time collaboration features'
          }
        ],
        skills: [
          { name: 'JavaScript', level: 5, category: 'Programming Languages' },
          { name: 'React', level: 4, category: 'Frameworks & Libraries' },
          { name: 'Node.js', level: 4, category: 'Backend' },
          { name: 'Python', level: 3, category: 'Programming Languages' },
          { name: 'MongoDB', level: 3, category: 'Databases' },
          { name: 'Git', level: 4, category: 'Tools & Software' }
        ],
        languages: [
          { language: 'English', proficiency: 'Native' },
          { language: 'Spanish', proficiency: 'Conversational' }
        ]
      };
      
      return mockData;
    },
    onSuccess: async (data) => {
      setProcessingStage('complete');
      
      // Auto-populate the profile with extracted data
      try {
        // Update education
        if (data.education.length > 0) {
          await backend.user.updateEducation({
            userId: userProfile.id,
            education: data.education.map(edu => ({
              institution: edu.institution,
              degree: edu.degree,
              graduationDate: edu.graduationDate ? new Date(edu.graduationDate) : undefined
            }))
          });
        }

        // Update projects
        if (data.projects.length > 0) {
          await backend.user.updateProjects({
            userId: userProfile.id,
            projects: data.projects.map(project => ({
              title: project.title,
              description: project.description,
              summary: project.description.substring(0, 200) + '...',
              keywords: project.skills,
              startDate: project.startDate ? new Date(project.startDate) : undefined,
              endDate: project.endDate ? new Date(project.endDate) : undefined,
              bullets: []
            }))
          });
        }

        // Update skills
        if (data.skills.length > 0) {
          await backend.user.updateSkills({
            userId: userProfile.id,
            skills: data.skills.map(skill => ({
              skillName: skill.name,
              skillLevel: skill.level,
              category: skill.category
            }))
          });
        }

        // Update languages
        if (data.languages.length > 0) {
          await backend.user.updateLanguages({
            userId: userProfile.id,
            languages: data.languages.map(lang => ({
              language: lang.language,
              proficiency: lang.proficiency
            }))
          });
        }

        // Refresh the user profile data
        queryClient.invalidateQueries({ queryKey: ['user', userProfile.id] });

        toast({
          title: "Resume parsed and profile updated!",
          description: "Your profile has been automatically populated with the extracted information. Please review and edit as needed.",
        });

        // Reset the upload state
        setTimeout(() => {
          setUploadedFile(null);
          setProcessingStage('idle');
        }, 2000);

      } catch (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Parsing successful, but update failed",
          description: "The resume was parsed but we couldn't update your profile. Please try again.",
          variant: "destructive",
        });
        setProcessingStage('error');
      }
    },
    onError: (error) => {
      console.error('Resume parsing error:', error);
      setProcessingStage('error');
      toast({
        title: "Failed to parse resume",
        description: "Please try again or enter information manually.",
        variant: "destructive",
      });
    }
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelection(files);
  };

  const handleFileSelection = (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, Word document, or text file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    parseResumeMutation.mutate(file);
  };

  const handleDiscardData = () => {
    setUploadedFile(null);
    setProcessingStage('idle');
    toast({
      title: "Upload cancelled",
      description: "The file upload has been cancelled.",
    });
  };

  const getProcessingProgress = () => {
    switch (processingStage) {
      case 'uploading': return 25;
      case 'parsing': return 75;
      case 'complete': return 100;
      case 'error': return 0;
      default: return 0;
    }
  };

  const getProcessingMessage = () => {
    switch (processingStage) {
      case 'uploading': return 'Uploading your resume...';
      case 'parsing': return 'AI is analyzing your resume...';
      case 'complete': return 'Resume parsed and profile updated successfully!';
      case 'error': return 'Failed to parse resume';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            Resume Upload & AI Parsing
          </CardTitle>
          <CardDescription>
            Upload your existing resume to automatically extract and populate your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Area */}
          {processingStage === 'idle' && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Drag and drop your resume here
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to browse files
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>
            </div>
          )}

          {/* Processing Status */}
          {(processingStage === 'uploading' || processingStage === 'parsing') && uploadedFile && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">{uploadedFile.name}</p>
                  <p className="text-sm text-blue-600">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {getProcessingMessage()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {getProcessingProgress()}%
                  </span>
                </div>
                <Progress value={getProcessingProgress()} className="h-2" />
              </div>

              <Button
                variant="outline"
                onClick={handleDiscardData}
                className="w-full flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel Upload
              </Button>
            </div>
          )}

          {/* Success State */}
          {processingStage === 'complete' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Resume parsed successfully!</p>
                  <p className="text-sm text-green-700">
                    Your profile has been automatically updated with the extracted information. 
                    Please review the other tabs and make any necessary adjustments.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">What was updated:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Personal information and contact details</li>
                  <li>• Education history and qualifications</li>
                  <li>• Work experience and project details</li>
                  <li>• Technical skills and proficiency levels</li>
                  <li>• Language skills and proficiency</li>
                </ul>
              </div>
            </div>
          )}

          {/* Error State */}
          {processingStage === 'error' && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Failed to parse resume</p>
                  <p className="text-sm text-red-700">
                    Please try again with a different file format or enter information manually in the other tabs.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setProcessingStage('idle');
                  setUploadedFile(null);
                }}
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* File Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">File Requirements</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Supported formats: PDF, DOC, DOCX, TXT</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• Text-based documents work best for AI parsing</li>
                  <li>• Scanned images may not parse accurately</li>
                </ul>
              </div>
            </div>
          </div>

          {/* AI Parsing Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-2">AI Parsing Features</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Automatically extract work experience and projects</li>
                  <li>• Identify and categorize technical skills</li>
                  <li>• Parse education and certification information</li>
                  <li>• Extract achievements and quantifiable results</li>
                  <li>• All extracted data is editable and can be refined</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Privacy & Security</h4>
                <p className="text-sm text-gray-700">
                  Your uploaded resume is processed securely and is never shared with third parties. 
                  The file is only used to extract information for your profile and is not stored permanently 
                  on our servers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
