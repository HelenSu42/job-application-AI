import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface ResumePreviewProps {
  resume: any;
  template: string;
  userProfile: any;
}

export default function ResumePreview({ resume, template, userProfile }: ResumePreviewProps) {
  if (!resume) {
    return (
      <div className="h-[600px] bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Resume Preview</p>
          <p className="text-sm">Generate your resume to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-white border border-gray-200 rounded-lg overflow-auto p-6">
      <div className="max-w-[210mm] mx-auto bg-white">
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">{userProfile?.name}</h1>
            <div className="text-sm text-gray-600 mt-1">
              {userProfile?.email} | {userProfile?.phone} | {userProfile?.location}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {resume.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
