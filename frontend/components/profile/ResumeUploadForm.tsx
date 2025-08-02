import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Eye, Save, X } from 'lucide-react';

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
    duration: string;
    description: string;
    skills: string[];
    achievements: string;
  }>;
  skills: Array<{
    name: string;
    level: number;
    category: string;
  }>;
}

export default function ResumeUploadForm({ userProfile }: ResumeUploadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingStage, setProcessingStage] = useState<'idle' | 'uploading' | 'parsing' | 'complete' | 'error'>('idle');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const parseResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      setProcessingStage('uploading');
      
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingStage('parsing');
      
      // Simulate AI parsing with mock data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted data
      const mockData: ExtractedData = {
        personalInfo: {
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA'
        },
        education: [
          {
            institution: 'Stanford University',
            degree: 'Bachelor of Science in Computer Science',
            graduationDate: '2020-06-15'
          }
        ],
        projects: [
          {
            title: 'E-commerce Platform',
            company: 'TechCorp Inc.',
            duration: '2021-01-15 to 2023-12-31',
            description: 'Led development of a scalable e-commerce platform serving 100k+ users. Implemented microservices architecture using Node.js and React.',
            skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
            achievements: '• Increased platform performance by 40%\n• Reduced load times from 3s to 800ms\n• Led team of 5 developers'
          },
          {
            title: 'Mobile Banking App',
            company: 'FinanceStart',
            duration: '2020-06-01 to 2020-12-31',
            description: 'Developed secure mobile banking application with biometric authentication and real-time transaction processing.',
            skills: ['React Native', 'TypeScript', 'Firebase', 'Stripe API'],
            achievements: '• Achieved 99.9% uptime\n• Processed $2M+ in transactions\n• 4.8/5 app store rating'
          }
        ],
        skills: [
          { name: 'React', level: 5, category: 'Frontend' },
          { name: 'Node.js', level: 4, category: 'Backend' },
          { name: 'TypeScript', level: 4, category: 'Programming Languages' },
          { name: 'AWS', level: 3, category: 'Cloud' },
          { name: 'Docker', level: 3, category: 'DevOps' }
        ]
      };
      
      return mockData;
    },
    onSuccess: (data) => {
      setExtractedData(data);
      setProcessingStage('complete');
      setShowPreview(true);
      toast({
        title: "Resume parsed successfully!",
        description: "Review the extracted information and save to your profile.",
      });
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

  const saveDataMutation = useMutation({
    mutationFn: async (data: ExtractedData) => {
      // Save extracted data to user profile
      // This would involve multiple API calls to update different sections
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Profile updated successfully!",
        description: "Your profile has been populated with the extracted information.",
      });
      queryClient.invalidateQueries({ queryKey: ['user', userProfile.id] });
      setShowPreview(false);
      setExtractedData(null);
      setUploadedFile(null);
      setProcessingStage('idle');
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({
        title: "Failed to save data",
        description: "Please try again or contact support.",
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

  const handleSaveData = () => {
    if (extractedData) {
      saveDataMutation.mutate(extractedData);
    }
  };

  const handleDiscardData = () => {
    setShowPreview(false);
    setExtractedData(null);
    setUploadedFile(null);
    setProcessingStage('idle');
    toast({
      title: "Data discarded",
      description: "The extracted information has been discarded.",
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
      case 'complete': return 'Resume parsed successfully!';
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
            </div>
          )}

          {/* Success State */}
          {processingStage === 'complete' && extractedData && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Resume parsed successfully!</p>
                  <p className="text-sm text-green-700">
                    Information extracted and ready for review
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? 'Hide' : 'Preview'}
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleSaveData}
                  disabled={saveDataMutation.isPending}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Save className="w-4 h-4" />
                  {saveDataMutation.isPending ? 'Saving...' : 'Save to Profile'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDiscardData}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Discard
                </Button>
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
                    Please try again or enter information manually in the other tabs.
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

      {/* Data Preview */}
      {showPreview && extractedData && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Extracted Information Preview
            </CardTitle>
            <CardDescription>
              Review the information extracted from your resume before saving
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Info Preview */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                Personal Information
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {Object.values(extractedData.personalInfo).filter(Boolean).length}/4 fields
                </Badge>
              </h4>
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Name:</span>
                  <p className="font-medium">{extractedData.personalInfo.name || 'Not found'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <p className="font-medium">{extractedData.personalInfo.email || 'Not found'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Phone:</span>
                  <p className="font-medium">{extractedData.personalInfo.phone || 'Not found'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Location:</span>
                  <p className="font-medium">{extractedData.personalInfo.location || 'Not found'}</p>
                </div>
              </div>
            </div>

            {/* Education Preview */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                Education
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {extractedData.education.length} entries
                </Badge>
              </h4>
              <div className="space-y-3">
                {extractedData.education.map((edu, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium">{edu.degree}</p>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    <p className="text-sm text-gray-500">{edu.graduationDate}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Preview */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                Projects & Experience
                <Badge variant="outline" className="bg-purple-100 text-purple-800">
                  {extractedData.projects.length} entries
                </Badge>
              </h4>
              <div className="space-y-4">
                {extractedData.projects.map((project, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-gray-600">{project.company}</p>
                        <p className="text-sm text-gray-500">{project.duration}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    {project.achievements && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Achievements:</p>
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap">{project.achievements}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Preview */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                Skills
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  {extractedData.skills.length} skills
                </Badge>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extractedData.skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-gray-600">{skill.category}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div
                          key={star}
                          className={`w-3 h-3 rounded-full ${
                            star <= skill.level ? 'bg-yellow-400' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
