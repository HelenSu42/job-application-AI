import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface SkillsGapAnalysisProps {
  skillsGap: Array<{
    skillName: string;
    required: boolean;
    userLevel: number;
    requiredLevel: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export default function SkillsGapAnalysis({ skillsGap }: SkillsGapAnalysisProps) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
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

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Skills Gap Analysis
        </CardTitle>
        <CardDescription>
          Skills that need improvement for this role
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skillsGap.map((skill, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(skill.priority)}
                  <span className="font-medium">{skill.skillName}</span>
                  {skill.required && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </div>
                <Badge className={getPriorityColor(skill.priority)}>
                  {skill.priority} priority
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Your level: {skill.userLevel}/5</span>
                <span>Required: {skill.requiredLevel}/5</span>
                <span>Gap: {skill.requiredLevel - skill.userLevel} levels</span>
              </div>
              
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded ${
                      level <= skill.userLevel ? 'bg-blue-500' :
                      level <= skill.requiredLevel ? 'bg-red-200' :
                      'bg-gray-200'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {skillsGap.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>Great! No significant skills gaps identified.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
