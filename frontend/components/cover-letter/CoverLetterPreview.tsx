import { Card, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';

interface CoverLetterPreviewProps {
  coverLetter: any;
  userProfile: any;
}

export default function CoverLetterPreview({ coverLetter, userProfile }: CoverLetterPreviewProps) {
  if (!coverLetter) {
    return (
      <div className="h-[600px] bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Mail className="w-16 h-16 mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Cover Letter Preview</p>
          <p className="text-sm">Generate your cover letter to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-white border border-gray-200 rounded-lg overflow-auto p-6">
      <div className="max-w-[210mm] mx-auto bg-white">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {userProfile?.name}<br />
              {userProfile?.email}<br />
              {userProfile?.phone}<br />
              {userProfile?.location}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {coverLetter.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
