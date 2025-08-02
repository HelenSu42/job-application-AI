import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import backend from '~backend/client';

interface EducationFormProps {
  userProfile: any;
}

export default function EducationForm({ userProfile }: EducationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [education, setEducation] = useState(
    userProfile.education?.length > 0 
      ? userProfile.education 
      : [{ institution: '', degree: '', graduationDate: '' }]
  );

  const updateEducationMutation = useMutation({
    mutationFn: async (educationData: any[]) => {
      return backend.user.updateEducation({
        userId: userProfile.id,
        education: educationData.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          graduationDate: edu.graduationDate ? new Date(edu.graduationDate) : undefined
        }))
      });
    },
    onSuccess: () => {
      toast({
        title: "Education updated",
        description: "Your education information has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['user', userProfile.id] });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "Update failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validEducation = education.filter(edu => edu.institution && edu.degree);
    updateEducationMutation.mutate(validEducation);
  };

  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', graduationDate: '' }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducationField = (index: number, field: string, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          Education
        </CardTitle>
        <CardDescription>
          Add your educational background and qualifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {education.map((edu, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                {education.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEducation(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`institution-${index}`}>Institution</Label>
                  <Input
                    id={`institution-${index}`}
                    value={edu.institution}
                    onChange={(e) => updateEducationField(index, 'institution', e.target.value)}
                    placeholder="University name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`degree-${index}`}>Degree</Label>
                  <Input
                    id={`degree-${index}`}
                    value={edu.degree}
                    onChange={(e) => updateEducationField(index, 'degree', e.target.value)}
                    placeholder="Bachelor of Science in Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`graduationDate-${index}`}>Graduation Date</Label>
                  <Input
                    id={`graduationDate-${index}`}
                    type="date"
                    value={edu.graduationDate}
                    onChange={(e) => updateEducationField(index, 'graduationDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={addEducation}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Education
            </Button>

            <Button 
              type="submit" 
              disabled={updateEducationMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {updateEducationMutation.isPending ? 'Updating...' : 'Update Education'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
