import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, GripVertical } from 'lucide-react';

interface SectionCustomizerProps {
  sections: Array<{
    type: string;
    order: number;
  }>;
  onSectionsChange: (sections: any[]) => void;
}

const availableSections = [
  { type: 'contact', label: 'Contact Information', required: true },
  { type: 'education', label: 'Education' },
  { type: 'projects', label: 'Projects & Experience' },
  { type: 'skills', label: 'Skills' },
  { type: 'languages', label: 'Languages' },
  { type: 'achievements', label: 'Achievements' }
];

export default function SectionCustomizer({ sections, onSectionsChange }: SectionCustomizerProps) {
  const toggleSection = (sectionType: string) => {
    const exists = sections.find(s => s.type === sectionType);
    
    if (exists) {
      // Remove section (unless required)
      const section = availableSections.find(s => s.type === sectionType);
      if (!section?.required) {
        onSectionsChange(sections.filter(s => s.type !== sectionType));
      }
    } else {
      // Add section
      const newOrder = Math.max(...sections.map(s => s.order), 0) + 1;
      onSectionsChange([...sections, { type: sectionType, order: newOrder }]);
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newSections.length) {
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      
      // Update order numbers
      newSections.forEach((section, i) => {
        section.order = i + 1;
      });
      
      onSectionsChange(newSections);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Resume Sections
        </CardTitle>
        <CardDescription>
          Customize which sections to include and their order
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {availableSections.map((availableSection) => {
            const isIncluded = sections.some(s => s.type === availableSection.type);
            const sectionIndex = sections.findIndex(s => s.type === availableSection.type);
            
            return (
              <div key={availableSection.type} className="flex items-center gap-3 p-2 border border-gray-200 rounded">
                <Checkbox
                  checked={isIncluded}
                  onCheckedChange={() => toggleSection(availableSection.type)}
                  disabled={availableSection.required}
                />
                
                <span className="flex-1 text-sm font-medium">
                  {availableSection.label}
                  {availableSection.required && (
                    <span className="text-xs text-gray-500 ml-1">(Required)</span>
                  )}
                </span>
                
                {isIncluded && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSection(sectionIndex, 'up')}
                      disabled={sectionIndex === 0}
                      className="h-6 w-6 p-0"
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSection(sectionIndex, 'down')}
                      disabled={sectionIndex === sections.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      ↓
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
