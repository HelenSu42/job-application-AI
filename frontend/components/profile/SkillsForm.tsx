import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Code, Plus, Trash2, Star } from 'lucide-react';
import backend from '~backend/client';

interface SkillsFormProps {
  userProfile: any;
}

const skillCategories = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases',
  'Cloud & DevOps',
  'Tools & Software',
  'Soft Skills',
  'Other'
];

const skillLevelDescriptions = {
  1: 'Beginner - Basic understanding',
  2: 'Some experience - Can work with guidance',
  3: 'Competent - Can work independently',
  4: 'Proficient - Can guide others',
  5: 'Expert - Can teach and lead others'
};

export default function SkillsForm({ userProfile }: SkillsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [skills, setSkills] = useState(
    userProfile.skills?.length > 0 
      ? userProfile.skills 
      : [{ skillName: '', skillLevel: 3, category: 'Programming Languages' }]
  );

  const updateSkillsMutation = useMutation({
    mutationFn: async (skillsData: any[]) => {
      return backend.user.updateSkills({
        userId: userProfile.id,
        skills: skillsData.map(skill => ({
          skillName: skill.skillName,
          skillLevel: skill.skillLevel,
          category: skill.category
        }))
      });
    },
    onSuccess: () => {
      toast({
        title: "Skills updated",
        description: "Your skills have been successfully updated.",
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
    const validSkills = skills.filter(skill => skill.skillName);
    updateSkillsMutation.mutate(validSkills);
  };

  const addSkill = () => {
    setSkills([...skills, { skillName: '', skillLevel: 3, category: 'Programming Languages' }]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkillField = (index: number, field: string, value: any) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  const renderStarRating = (level: number, onChange: (level: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 rounded transition-colors ${
              star <= level ? 'text-yellow-500' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {skillLevelDescriptions[level as keyof typeof skillLevelDescriptions]}
        </span>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Code className="w-5 h-5 text-blue-600" />
          Skills Assessment
        </CardTitle>
        <CardDescription>
          Rate your skills on a scale of 1-5. Hover over the stars for level descriptions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {skills.map((skill, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-900">Skill {index + 1}</h4>
                {skills.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`skillName-${index}`}>Skill Name</Label>
                  <Input
                    id={`skillName-${index}`}
                    value={skill.skillName}
                    onChange={(e) => updateSkillField(index, 'skillName', e.target.value)}
                    placeholder="e.g., React, Python, Project Management"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`category-${index}`}>Category</Label>
                  <Select 
                    value={skill.category} 
                    onValueChange={(value) => updateSkillField(index, 'category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skillCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skill Level</Label>
                {renderStarRating(skill.skillLevel, (level) => updateSkillField(index, 'skillLevel', level))}
              </div>
            </div>
          ))}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={addSkill}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Skill
            </Button>

            <Button 
              type="submit" 
              disabled={updateSkillsMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {updateSkillsMutation.isPending ? 'Updating...' : 'Update Skills'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
