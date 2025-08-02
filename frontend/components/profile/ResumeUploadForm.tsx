import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface ResumeUploadFormProps {
  userProfile: any;
}

export default function ResumeUploadForm({ userProfile }: ResumeUploadFormProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or Word document.",
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
    toast({
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });
  };

  const handleParseResume = () => {
    if (!uploadedFile) return;

    toast({
      title: "Parsing resume",
      description: "AI resume parsing feature will be implemented soon.",
    });
  };

  const removeFile = () => {
    setUploadedFile(null);
    toast({
      title: "File removed",
      description: "The uploaded file has been removed.",
    });
  };

  return (
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
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : uploadedFile 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploadedFile ? (
            <div className="space-y-4">
              <FileText className="w-16 h-16 text-green-600 mx-auto" />
              <div>
                <p className="text-lg font-medium text-green-800">{uploadedFile.name}</p>
                <p className="text-sm text-green-600">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleParseResume}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Parse with AI
                </Button>
                <Button variant="outline" onClick={removeFile}>
                  Remove File
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-16 h-16 text-gray-400 mx-auto" />
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
                accept=".pdf,.doc,.docx"
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
          )}
        </div>

        {/* File Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">File Requirements</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Supported formats: PDF, DOC, DOCX</li>
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
                <li>• Generate optimized bullet points for different job types</li>
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
  );
}
