import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, Briefcase, GraduationCap, Building } from 'lucide-react';

interface GapAnalysisProps {
  skillsGap: Array<{
    skillName: string;
    required: boolean;
    userLevel: number;
    requiredLevel: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  userProfile: any;
  jobDescription: string;
}

export default function GapAnalysis({ skillsGap, userProfile, jobDescription }: GapAnalysisProps) {
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

  // Calculate years of experience
  const calculateYearsOfExperience = () => {
    if (!userProfile.projects || userProfile.projects.length === 0) return 0;
    
    const now = new Date();
    let totalMonths = 0;
    
    userProfile.projects.forEach((project: any) => {
      if (project.startDate) {
        const startDate = new Date(project.startDate);
        const endDate = project.endDate ? new Date(project.endDate) : now;
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
        totalMonths += Math.max(0, months);
      }
    });
    
    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
  };

  // Analyze industry experience
  const analyzeIndustryExperience = () => {
    const userIndustries = new Set();
    userProfile.projects?.forEach((project: any) => {
      project.keywords?.forEach((keyword: string) => {
        userIndustries.add(keyword.toLowerCase());
      });
    });

    // Simple industry matching based on common keywords
    const jobDescLower = jobDescription.toLowerCase();
    const commonIndustries = ['fintech', 'healthcare', 'e-commerce', 'saas', 'ai', 'blockchain', 'gaming', 'education'];
    
    const jobIndustries = commonIndustries.filter(industry => 
      jobDescLower.includes(industry) || jobDescLower.includes(industry.replace('-', ' '))
    );

    const matchingIndustries = jobIndustries.filter(industry => 
      Array.from(userIndustries).some(userInd => 
        (userInd as string).includes(industry) || industry.includes(userInd as string)
      )
    );

    return {
      userIndustries: Array.from(userIndustries),
      jobIndustries,
      matchingIndustries,
      hasMatch: matchingIndustries.length > 0
    };
  };

  const yearsOfExperience = calculateYearsOfExperience();
  const industryAnalysis = analyzeIndustryExperience();

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          Gap Analysis
        </CardTitle>
        <CardDescription>
          Comprehensive analysis of skills, experience, and industry gaps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Experience Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Years of Experience</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">{yearsOfExperience}</div>
            <div className="text-sm text-blue-600">Total professional experience</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Industry Match</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {industryAnalysis.hasMatch ? '✓' : '✗'}
            </div>
            <div className="text-sm text-purple-600">
              {industryAnalysis.hasMatch ? 'Relevant experience' : 'New industry'}
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Education Level</span>
            </div>
            <div className="text-lg font-bold text-green-700">
              {userProfile.education?.length > 0 ? 'Qualified' : 'N/A'}
            </div>
            <div className="text-sm text-green-600">
              {userProfile.education?.length || 0} degree(s)
            </div>
          </div>
        </div>

        {/* Industry Analysis */}
        {industryAnalysis.jobIndustries.length > 0 && (
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Industry Experience Analysis
            </h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Job requires experience in:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {industryAnalysis.jobIndustries.map((industry, index) => (
                    <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800">
                      {industry}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Your industry experience:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {industryAnalysis.userIndustries.slice(0, 8).map((industry, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className={
                        industryAnalysis.matchingIndustries.some(match => 
                          industry.includes(match) || match.includes(industry)
                        ) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }
                    >
                      {industry}
                    </Badge>
                  ))}
                  {industryAnalysis.userIndustries.length > 8 && (
                    <Badge variant="outline" className="bg-gray-100 text-gray-600">
                      +{industryAnalysis.userIndustries.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills Gap */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Skills Gap Analysis</h4>
          <div className="space-y-3">
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
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span>Your level: {skill.userLevel}/5</span>
                  <span>Required: {skill.requiredLevel}/5</span>
                  <span>Gap: {skill.requiredLevel - skill.userLevel} levels</span>
                </div>
                
                <div className="flex gap-1">
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
        </div>
      </CardContent>
    </Card>
  );
}
