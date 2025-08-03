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
  onParsingComplete?: () => void;
}

export default function ResumeUploadForm({ userProfile, onParsingComplete }: ResumeUploadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingStage, setProcessingStage] = useState<'idle' | 'uploading' | 'parsing' | 'updating' | 'complete' | 'error'>('idle');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const parseResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log('=== FRONTEND RESUME PROCESSING START ===');
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      setProcessingStage('uploading');
      setDebugInfo('Reading file content...');
      
      // Read file content based on file type
      let text: string;
      try {
        text = await readFileContent(file);
        console.log('File read successfully, length:', text.length);
        console.log('File content preview:', text.substring(0, 200));
        setDebugInfo(`File read: ${text.length} characters`);
      } catch (error) {
        console.error('File reading error:', error);
        setDebugInfo('Error reading file');
        throw new Error('Failed to read file content');
      }
      
      setProcessingStage('parsing');
      setDebugInfo('AI analyzing resume...');
      
      // Parse resume using backend API
      let extractedData;
      try {
        console.log('Calling backend parse API...');
        extractedData = await backend.user.parseResume({
          userId: userProfile.id,
          resumeText: text
        });
        console.log('Backend parsing completed:', extractedData);
        setDebugInfo('AI parsing completed');
      } catch (error) {
        console.error('Backend parsing error:', error);
        setDebugInfo('AI parsing failed');
        throw new Error('Failed to parse resume with AI');
      }
      
      setProcessingStage('updating');
      setDebugInfo('Updating profile...');
      
      // Update user profile with extracted data
      const updatePromises = [];
      let updateCount = 0;
      
      try {
        // Update education if data exists
        if (extractedData.education && extractedData.education.length > 0) {
          console.log('Updating education:', extractedData.education);
          updatePromises.push(
            backend.user.updateEducation({
              userId: userProfile.id,
              education: extractedData.education.map((edu: any) => ({
                institution: edu.institution,
                degree: edu.degree,
                graduationDate: edu.graduationDate ? new Date(edu.graduationDate) : undefined
              }))
            }).then(() => {
              updateCount++;
              console.log('Education updated successfully');
            })
          );
        }

        // Update projects if data exists
        if (extractedData.projects && extractedData.projects.length > 0) {
          console.log('Updating projects:', extractedData.projects);
          updatePromises.push(
            backend.user.updateProjects({
              userId: userProfile.id,
              projects: extractedData.projects.map((project: any) => ({
                title: project.title,
                description: project.description,
                summary: project.description && project.description.length > 200 
                  ? project.description.substring(0, 200) + '...' 
                  : project.description,
                keywords: project.skills || [],
                startDate: project.startDate ? new Date(project.startDate) : undefined,
                endDate: project.endDate ? new Date(project.endDate) : undefined,
                bullets: project.achievements ? [{
                  bulletText: project.achievements,
                  targetType: 'achievement',
                  keywords: project.skills || []
                }] : []
              }))
            }).then(() => {
              updateCount++;
              console.log('Projects updated successfully');
            })
          );
        }

        // Update skills if data exists
        if (extractedData.skills && extractedData.skills.length > 0) {
          console.log('Updating skills:', extractedData.skills);
          updatePromises.push(
            backend.user.updateSkills({
              userId: userProfile.id,
              skills: extractedData.skills.map((skill: any) => ({
                skillName: skill.name,
                skillLevel: skill.level,
                category: skill.category
              }))
            }).then(() => {
              updateCount++;
              console.log('Skills updated successfully');
            })
          );
        }

        // Update languages if data exists
        if (extractedData.languages && extractedData.languages.length > 0) {
          console.log('Updating languages:', extractedData.languages);
          updatePromises.push(
            backend.user.updateLanguages({
              userId: userProfile.id,
              languages: extractedData.languages.map((lang: any) => ({
                language: lang.language,
                proficiency: lang.proficiency
              }))
            }).then(() => {
              updateCount++;
              console.log('Languages updated successfully');
            })
          );
        }

        // Execute all updates
        console.log(`Executing ${updatePromises.length} update operations...`);
        await Promise.all(updatePromises);
        console.log(`Successfully completed ${updateCount} updates`);
        setDebugInfo(`Updated ${updateCount} sections`);
        
      } catch (error) {
        console.error('Profile update error:', error);
        setDebugInfo('Profile update failed');
        throw new Error('Failed to update profile with extracted data');
      }
      
      console.log('=== FRONTEND RESUME PROCESSING SUCCESS ===');
      return extractedData;
    },
    onSuccess: (data) => {
      console.log('Mutation success, extracted data:', data);
      setProcessingStage('complete');
      setExtractedData(data);
      setDebugInfo('Profile updated successfully!');
      
      // Refresh the user profile data
      queryClient.invalidateQueries({ queryKey: ['user', userProfile.id] });

      toast({
        title: "Resume parsed and profile updated!",
        description: "Your profile has been automatically populated. Please review and edit the information in other tabs.",
      });

      // Reset the upload state after a delay and trigger callback
      setTimeout(() => {
        setUploadedFile(null);
        setProcessingStage('idle');
        setExtractedData(null);
        setDebugInfo('');
        // Call the callback to switch to other tabs
        if (onParsingComplete) {
          onParsingComplete();
        }
      }, 3000);
    },
    onError: (error) => {
      console.error('=== FRONTEND RESUME PROCESSING ERROR ===');
      console.error('Error details:', error);
      setProcessingStage('error');
      setDebugInfo(`Error: ${error.message}`);
      toast({
        title: "Failed to parse resume",
        description: "Please try again or enter information manually in the other tabs.",
        variant: "destructive",
      });
    }
  });

  const loadPDFJS = async () => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js'));
      document.head.appendChild(script);
    });
  };

  const loadMammoth = async () => {
    return new Promise((resolve, reject) => {
      if ((window as any).mammoth) {
        resolve((window as any).mammoth);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js';
      script.onload = () => {
        resolve((window as any).mammoth);
      };
      script.onerror = () => reject(new Error('Failed to load Mammoth.js'));
      document.head.appendChild(script);
    });
  };

  const readFileContent = async (file: File): Promise<string> => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    console.log('Reading file:', fileName, 'Type:', fileType);
    
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return readTextFile(file);
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return readPDFFile(file);
    } else if (
      fileType === 'application/msword' || 
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.doc') || 
      fileName.endsWith('.docx')
    ) {
      return readWordFile(file);
    } else {
      // Fallback: try to read as text
      console.warn('Unknown file type, attempting to read as text');
      return readTextFile(file);
    }
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  };

  const readPDFFile = async (file: File): Promise<string> => {
    try {
      const pdfjsLib = await loadPDFJS();
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      console.log('PDF text extracted, length:', fullText.length);
      return fullText.trim();
    } catch (error) {
      console.error('PDF reading error:', error);
      throw new Error('Failed to read PDF file. Please try converting to text format.');
    }
  };

  const readWordFile = async (file: File): Promise<string> => {
    try {
      const mammoth = await loadMammoth();
      
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      console.log('Word document text extracted, length:', result.value.length);
      
      if (result.messages && result.messages.length > 0) {
        console.warn('Word parsing messages:', result.messages);
      }
      
      return result.value.trim();
    } catch (error) {
      console.error('Word document reading error:', error);
      throw new Error('Failed to read Word document. Please try converting to text format.');
    }
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
    
    const fileName = file.name.toLowerCase();
    const isValidType = allowedTypes.includes(file.type) || 
                       fileName.endsWith('.pdf') || 
                       fileName.endsWith('.doc') || 
                       fileName.endsWith('.docx') || 
                       fileName.endsWith('.txt');
    
    if (!isValidType) {
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

    console.log('File selected for processing:', file.name);
    setUploadedFile(file);
    setDebugInfo('');
    parseResumeMutation.mutate(file);
  };

  const handleDiscardData = () => {
    setUploadedFile(null);
    setProcessingStage('idle');
    setExtractedData(null);
    setDebugInfo('');
    toast({
      title: "Upload cancelled",
      description: "The file upload has been cancelled.",
    });
  };

  const handleViewExtractedData = () => {
    if (onParsingComplete) {
      onParsingComplete();
    }
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
                {debugInfo && (
                  <p className="text-xs text-gray-500">{debugInfo}</p>
                )}
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
          {processingStage === 'complete' && extractedData && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Resume parsed successfully!</p>
                  <p className="text-sm text-green-700">
                    Your profile has been automatically updated with the extracted information.
                  </p>
                </div>
              </div>

              {/* Show extracted data summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Extracted Information:</h4>
                <div className="space-y-2 text-sm">
                  {extractedData.personalInfo && (
                    <div>
                      <span className="font-medium text-blue-800">Personal Info:</span>
                      <span className="text-blue-700 ml-2">
                        {extractedData.personalInfo.name} ({extractedData.personalInfo.email})
                      </span>
                    </div>
                  )}
                  {extractedData.education && extractedData.education.length > 0 && (
                    <div>
                      <span className="font-medium text-blue-800">Education:</span>
                      <span className="text-blue-700 ml-2">
                        {extractedData.education.length} degree(s)
                      </span>
                    </div>
                  )}
                  {extractedData.projects && extractedData.projects.length > 0 && (
                    <div>
                      <span className="font-medium text-blue-800">Projects/Experience:</span>
                      <span className="text-blue-700 ml-2">
                        {extractedData.projects.length} project(s)
                      </span>
                    </div>
                  )}
                  {extractedData.skills && extractedData.skills.length > 0 && (
                    <div>
                      <span className="font-medium text-blue-800">Skills:</span>
                      <span className="text-blue-700 ml-2">
                        {extractedData.skills.length} skill(s)
                      </span>
                    </div>
                  )}
                  {extractedData.languages && extractedData.languages.length > 0 && (
                    <div>
                      <span className="font-medium text-blue-800">Languages:</span>
                      <span className="text-blue-700 ml-2">
                        {extractedData.languages.length} language(s)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleViewExtractedData}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Review & Edit Information
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setProcessingStage('idle');
                    setUploadedFile(null);
                    setExtractedData(null);
                    setDebugInfo('');
                  }}
                >
                  Upload Another
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
                    Please try again with a different file format or enter information manually in the other tabs.
                  </p>
                  {debugInfo && (
                    <p className="text-xs text-red-600 mt-1">Debug: {debugInfo}</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setProcessingStage('idle');
                  setUploadedFile(null);
                  setDebugInfo('');
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
                <h4 className="font-medium text-blue-900 mb-2">Supported File Formats</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>PDF files (.pdf)</strong> - Full text extraction support</li>
                  <li>• <strong>Word documents (.doc, .docx)</strong> - Complete document parsing</li>
                  <li>• <strong>Text files (.txt)</strong> - Direct text processing</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• Scanned documents may have limited accuracy</li>
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
                  <li>• Support for multiple document formats</li>
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
                  on our servers. All processing happens in your browser when possible.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
