import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Code, Briefcase, GraduationCap, Clock } from 'lucide-react';

interface RecommendationsListProps {
  recommendations: Array<{
    type: 'skill' | 'project' | 'education';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    timeToComplete?: string;
  }>;
}

export default function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'skill':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'project':
        return <Briefcase className="w-4 h-4 text-green-500" />;
      case 'education':
        return <GraduationCap className="w-4 h-4 text-purple-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
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

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Improvement Recommendations
        </CardTitle>
        <CardDescription>
          Personalized suggestions to strengthen your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(rec.type)}
                  <span className="font-medium">{rec.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                  {rec.timeToComplete && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {rec.timeToComplete}
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-700">{rec.description}</p>
              
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {recommendations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <p>No specific recommendations at this time.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
