import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Target, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import backend from '~backend/client';
import JobMatchRadar from '../components/analysis/JobMatchRadar';
import SkillsGapAnalysis from '../components/analysis/SkillsGapAnalysis';
import SalaryAnalysis from '../components/analysis/SalaryAnalysis';
import RecommendationsList from '../components/analysis/RecommendationsList';

export default function JobAnalysisPage() {
  const { userId } = useParams<{ userId: string }>();
  const { toast } = useToast();
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => backend.user.get({ id: parseInt(userId!) }),
    enabled: !!userId
  });

  const analyzeJobMutation = useMutation({
    mutationFn: async (jobDesc: string) => {
      if (!userProfile) throw new Error('User profile not loaded');
      
      return backend.analysis.analyzeJob({
        jobDescription: jobDesc,
        userSkills: userProfile.skills.map(skill => ({
          skillName: skill.skillName,
          skillLevel: skill.skillLevel,
          category: skill.category
        })),
        userEducation: userProfile.education.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          graduationDate: edu.graduationDate
        })),
        userProjects: userProfile.projects.map(project => ({
          title: project.title,
          description: project.description,
          keywords: project.keywords,
          startDate: project.startDate,
          endDate: project.endDate
        })),
        currentSalary: userProfile.currentSalary
      });
    },
    onSuccess: (result) => {
      setAnalysisResult(result);
      toast({
        title: "Analysis complete!",
        description: "Your job compatibility analysis is ready.",
      });
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  });

  const handleAnalyze = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Missing job description",
        description: "Please paste the job description to analyze.",
        variant: "destructive",
      });
      return;
    }
    analyzeJobMutation.mutate(jobDescription);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to={`/profile/${userId}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
          {analysisResult && (
            <Link to={`/improvement/${userId}`} state={{ analysisResult }}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                Create Improvement Plan
              </Button>
            </Link>
          )}
        </div>

        <div className="mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                Job Analysis
              </CardTitle>
              <CardDescription className="text-gray-600">
                Analyze job descriptions to understand compatibility and identify improvement areas
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Job Description</CardTitle>
              <CardDescription>
                Paste the complete job description you want to analyze
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>
              <Button 
                onClick={handleAnalyze}
                disabled={analyzeJobMutation.isPending || !jobDescription.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {analyzeJobMutation.isPending ? 'Analyzing...' : 'Analyze Job Match'}
              </Button>
            </CardContent>
          </Card>

          {analysisResult && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Overall Match
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {analysisResult.overallMatchPercentage}%
                  </div>
                  <p className="text-gray-600 mb-4">Compatibility Score</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    analysisResult.overallMatchPercentage >= 80 ? 'bg-green-100 text-green-800' :
                    analysisResult.overallMatchPercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                    {analysisResult.overallMatchPercentage >= 80 ? 'Excellent Match' :
                     analysisResult.overallMatchPercentage >= 60 ? 'Good Match' :
                     'Needs Improvement'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {analysisResult && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <JobMatchRadar matchingScore={analysisResult.matchingScore} />
              {analysisResult.salaryAnalysis && (
                <SalaryAnalysis salaryAnalysis={analysisResult.salaryAnalysis} />
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkillsGapAnalysis skillsGap={analysisResult.skillsGap} />
              <RecommendationsList recommendations={analysisResult.recommendations} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
