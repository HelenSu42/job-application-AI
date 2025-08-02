import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface OptimizationSuggestionsProps {
  suggestions: Array<{
    type: 'keyword' | 'format' | 'length' | 'content';
    message: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  atsScore: number;
}

export default function OptimizationSuggestions({ suggestions, atsScore }: OptimizationSuggestionsProps) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Optimization
        </CardTitle>
        <CardDescription>
          ATS compatibility and improvement suggestions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 text-center">
          <div className={`text-3xl font-bold ${getScoreColor(atsScore)}`}>
            {atsScore}/100
          </div>
          <p className="text-sm text-gray-600">ATS Compatibility Score</p>
        </div>
        
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
              {getPriorityIcon(suggestion.priority)}
              
              <div className="flex-1">
                <p className="text-sm text-gray-700">{suggestion.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getPriorityColor(suggestion.priority)}>
                    {suggestion.priority}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.type}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {suggestions.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>Your resume looks great! No optimization suggestions at this time.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
