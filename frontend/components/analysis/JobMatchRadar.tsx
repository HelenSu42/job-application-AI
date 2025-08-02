import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';

interface JobMatchRadarProps {
  matchingScore: {
    education: number;
    projects: number;
    skills: number;
    network: number;
  };
}

export default function JobMatchRadar({ matchingScore }: JobMatchRadarProps) {
  const categories = [
    { name: 'Education', score: matchingScore.education, color: 'text-blue-600' },
    { name: 'Projects', score: matchingScore.projects, color: 'text-green-600' },
    { name: 'Skills', score: matchingScore.skills, color: 'text-purple-600' },
    { name: 'Network', score: matchingScore.network, color: 'text-orange-600' }
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Job Match Analysis
        </CardTitle>
        <CardDescription>
          Your compatibility across key areas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`font-medium ${category.color}`}>{category.name}</span>
                <span className="text-sm text-gray-600">{category.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    category.score >= 80 ? 'bg-green-500' :
                    category.score >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${category.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Analysis Summary</h4>
          <p className="text-sm text-blue-700">
            Your strongest area is {categories.reduce((max, cat) => cat.score > max.score ? cat : max).name.toLowerCase()}, 
            while {categories.reduce((min, cat) => cat.score < min.score ? cat : min).name.toLowerCase()} 
            could use improvement for this role.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
