import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

interface TimelineViewProps {
  timeline: Array<{
    week: number;
    tasks: Array<{
      title: string;
      description: string;
      estimatedHours: number;
      skillsImproved: string[];
    }>;
  }>;
}

export default function TimelineView({ timeline }: TimelineViewProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Learning Timeline
        </CardTitle>
        <CardDescription>
          Week-by-week improvement plan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.map((week, index) => (
            <div key={index} className="relative">
              {index < timeline.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>
              )}
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {week.week}
                </div>
                
                <div className="flex-1 space-y-2">
                  <h4 className="font-medium text-gray-900">Week {week.week}</h4>
                  
                  {week.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{task.title}</span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {task.estimatedHours}h
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {task.skillsImproved.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {timeline.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No timeline generated yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
