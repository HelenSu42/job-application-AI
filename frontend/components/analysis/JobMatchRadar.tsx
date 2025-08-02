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
    { name: 'Education', score: matchingScore.education, color: '#3B82F6', angle: 0 },
    { name: 'Projects', score: matchingScore.projects, color: '#10B981', angle: 90 },
    { name: 'Skills', score: matchingScore.skills, color: '#8B5CF6', angle: 180 },
    { name: 'Network', score: matchingScore.network, color: '#F59E0B', angle: 270 }
  ];

  const centerX = 120;
  const centerY = 120;
  const maxRadius = 80;

  // Generate radar chart points
  const generateRadarPoints = () => {
    return categories.map(category => {
      const angle = (category.angle - 90) * (Math.PI / 180); // Convert to radians and adjust for top start
      const radius = (category.score / 100) * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y, ...category };
    });
  };

  const radarPoints = generateRadarPoints();
  const pathData = radarPoints.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';

  // Generate grid circles
  const gridCircles = [20, 40, 60, 80].map(radius => (
    <circle
      key={radius}
      cx={centerX}
      cy={centerY}
      r={radius}
      fill="none"
      stroke="#E5E7EB"
      strokeWidth="1"
    />
  ));

  // Generate grid lines
  const gridLines = categories.map(category => {
    const angle = (category.angle - 90) * (Math.PI / 180);
    const endX = centerX + maxRadius * Math.cos(angle);
    const endY = centerY + maxRadius * Math.sin(angle);
    return (
      <line
        key={category.name}
        x1={centerX}
        y1={centerY}
        x2={endX}
        y2={endY}
        stroke="#E5E7EB"
        strokeWidth="1"
      />
    );
  });

  // Generate labels
  const labels = categories.map(category => {
    const angle = (category.angle - 90) * (Math.PI / 180);
    const labelRadius = maxRadius + 20;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    
    return (
      <g key={category.name}>
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm font-medium fill-gray-700"
        >
          {category.name}
        </text>
        <text
          x={x}
          y={y + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-gray-500"
        >
          {category.score}%
        </text>
      </g>
    );
  });

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
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Radar Chart */}
          <div className="flex-shrink-0">
            <svg width="240" height="240" className="overflow-visible">
              {/* Grid */}
              {gridCircles}
              {gridLines}
              
              {/* Data area */}
              <path
                d={pathData}
                fill="rgba(59, 130, 246, 0.2)"
                stroke="#3B82F6"
                strokeWidth="2"
              />
              
              {/* Data points */}
              {radarPoints.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={point.color}
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
              
              {/* Labels */}
              {labels}
              
              {/* Center point */}
              <circle
                cx={centerX}
                cy={centerY}
                r="2"
                fill="#6B7280"
              />
            </svg>
          </div>

          {/* Legend and Summary */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <div key={category.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-sm text-gray-600">{category.score}%</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Analysis Summary</h4>
              <p className="text-sm text-blue-700">
                Your strongest area is {categories.reduce((max, cat) => cat.score > max.score ? cat : max).name.toLowerCase()}, 
                while {categories.reduce((min, cat) => cat.score < min.score ? cat : min).name.toLowerCase()} 
                could use improvement for this role.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
