import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Clock } from 'lucide-react';

interface SkillsPriorityProps {
  skills: Array<{
    skillName: string;
    currentLevel: number;
    targetLevel: number;
    priority: 'high' | 'medium' | 'low';
    estimatedTimeToImprove: number;
  }>;
}

export default function SkillsPriority({ skills }: SkillsPriorityProps) {
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
          <Target className="w-5 h-5 text-blue-600" />
          Priority Skills
        </CardTitle>
        <CardDescription>
          Skills ranked by importance and improvement potential
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{skill.skillName}</span>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(skill.priority)}>
                    {skill.priority}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {skill.estimatedTimeToImprove}h
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span>Current: {skill.currentLevel}/5</span>
                <span>Target: {skill.targetLevel}/5</span>
                <span>Improvement: +{skill.targetLevel - skill.currentLevel} levels</span>
              </div>
              
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-2 flex-1 rounded ${
                      level <= skill.currentLevel ? 'bg-blue-500' :
                      level <= skill.targetLevel ? 'bg-green-200' :
                      'bg-gray-200'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {skills.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No priority skills identified.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
