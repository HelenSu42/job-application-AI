import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Clock, Star } from 'lucide-react';

interface ProjectSuggestionsProps {
  projects: Array<{
    title: string;
    description: string;
    skillsTargeted: string[];
    estimatedTime: number;
    matchRelevance: number;
  }>;
}

export default function ProjectSuggestions({ projects }: ProjectSuggestionsProps) {
  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 8) return 'text-green-600';
    if (relevance >= 6) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          Project Suggestions
        </CardTitle>
        <CardDescription>
          Hands-on projects to build relevant skills and experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{project.title}</h4>
                <div className="flex items-center gap-1">
                  <Star className={`w-4 h-4 ${getRelevanceColor(project.matchRelevance)}`} />
                  <span className={`text-sm ${getRelevanceColor(project.matchRelevance)}`}>
                    {project.matchRelevance}/10
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{project.description}</p>
              
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <Clock className="w-3 h-3" />
                {project.estimatedTime} hours
              </div>
              
              <div className="flex flex-wrap gap-1">
                {project.skillsTargeted.map((skill, skillIndex) => (
                  <Badge key={skillIndex} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {projects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <p>No project suggestions available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
