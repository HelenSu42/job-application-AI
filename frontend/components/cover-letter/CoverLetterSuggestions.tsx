import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target } from 'lucide-react';

interface CoverLetterSuggestionsProps {
  suggestions: string[];
  keywordMatches: number;
}

export default function CoverLetterSuggestions({ suggestions, keywordMatches }: CoverLetterSuggestionsProps) {
  const getKeywordColor = (matches: number) => {
    if (matches >= 15) return 'text-green-600';
    if (matches >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Suggestions
        </CardTitle>
        <CardDescription>
          Tips to improve your cover letter
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-center">
          <div className={`text-2xl font-bold ${getKeywordColor(keywordMatches)}`}>
            {keywordMatches}
          </div>
          <p className="text-sm text-gray-600">Keyword Matches</p>
        </div>
        
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
              <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{suggestion}</p>
            </div>
          ))}
        </div>
        
        {suggestions.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <p>Your cover letter looks great! No suggestions at this time.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
