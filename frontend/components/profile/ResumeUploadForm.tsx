import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, X } from 'lucide-react';
import backend from '~backend/client';

interface ResumeUploadFormProps {
  userProfile: any;
}

export default function ResumeUploadForm({ userProfile }: ResumeUploadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingStage, setProcessingStage] = useState<'idle' | 'uploading' | 'parsing' | 'updating' | 'complete' | 'error'>('idle');

  const parseResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      setProcessingStage('uploading');
      
      // Read file content
      const text = await readFileAsText(file);
      
      setProcessingStage('parsing');
      
      // Parse resume using backend API
      const extractedData = await backend.user.parseResume({
        userId: userProfile.id,
        resumeText: text
      });
      
      setProcessingStage('updating');
      
      // Update user profile with extracted data
      const updatePromises = [];
      
      // Update education if data exists
      if (extractedData.education && extractedData.education.length > 0) {
        updatePromises.push(
          backend.user.updateEducation({
            userId: userProfile.id,
            education: extractedData.education.map(edu => ({
              institution: edu.institution,
              degree: edu.degree,
              graduationDate: edu.graduationDate ? new Date(edu.graduationDate) : undefined
            }))
          })
        );
      }

      // Update projects if data exists
      if (extractedData.projects && extractedData.projects.length > 0) {
        updatePromises.push(
          backend.user.updateProjects({
            userId: userProfile.id,
            projects: extractedData.projects.map(project => ({
              title: project.title,
              description: project.description,
              summary: project.description.length > 200 ? project.description.substring(0, 200) + '...' : project.description,
              keywords: project.skills || [],
              startDate: project.startDate ? new Date(project.startDate) : undefined,
              endDate: project.endDate ? new Date(project.endDate) : undefined,
              bullets: []
            }))
          })
        );
      }

      // Update skills if data exists
      if (extractedData.skills && extractedData.skills.length > 0) {
        updatePromises.push(
          backend.user.updateSkills({
            userId: userProfile.id,
            skills: extractedData.skills.map(skill => ({
              skillName: skill.name,
              skillLevel: skill.level,
              category: skill.category
            }))
          })
        );
      }

      // Update languages if data exists
      if (extractedData.languages && extractedData.languages.length > 0) {
        updatePromises.push(
          backend.user.updateLanguages({
            userId: userProfile.id,
            languages: extractedData.languages.map(lang => ({
              language: lang.language,
              proficiency: lang.proficiency
            }))
          })
        );
      }

      // Execute all updates
      await Promise.all(updatePromises);
      
      return extractedData;
    },
    onSuccess: (extractedData) => {
      setProcessingStage('complete');
      
      // Refresh the user profile data
      queryClient.invalidateQueries({ queryKey: ['user', userProfile.id] });

      toast({
        title: "Resume parsed and profile updated!",
        description: "Your profile has been automatically populated with the extracted information. Please review the other tabs.",
      });

      // Reset the upload state after a delay
      setTimeout(() => {
        setUploadedFile(null);
        setProcessingStage('idle');
      }, 3000);
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

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

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
      case 'parsing': return 50;
      case 'updating': return 75;
      case 'complete': return 100;
      case 'error': return 0;
      default: return 0;
    }
  };

  const getProcessingMessage = () => {
    switch (processingStage) {
      case 'uploading': return 'Reading your resume file...';
      case 'parsing': return 'AI is analyzing your resume...';
      case 'updating': return 'Updating your profile...';
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
          {(processingStage === 'uploading' || processingStage === 'parsing' || processingStage === 'updating') && uploadedFile && (
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
                disabled={processingStage === 'updating'}
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
                <p className="text-sm text-blue-600 mt-3 font-medium">
                  💡 Switch to other tabs to see the updated information!
                </p>
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
