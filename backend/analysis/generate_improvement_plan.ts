import { api } from "encore.dev/api";

export interface GenerateImprovementPlanRequest {
  skillsGap: SkillGap[];
  timeUntilInterview: number; // days
  userAvailability: "full-time" | "part-time" | "minimal";
}

export interface SkillGap {
  skillName: string;
  required: boolean;
  userLevel: number;
  requiredLevel: number;
  priority: "high" | "medium" | "low";
}

export interface ImprovementPlan {
  timeline: TimelineItem[];
  prioritizedSkills: PrioritizedSkill[];
  projectSuggestions: ProjectSuggestion[];
  estimatedCompletionRate: number;
}

export interface TimelineItem {
  week: number;
  tasks: Task[];
}

export interface Task {
  title: string;
  description: string;
  estimatedHours: number;
  skillsImproved: string[];
}

export interface PrioritizedSkill {
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  priority: "high" | "medium" | "low";
  estimatedTimeToImprove: number; // hours
}

export interface ProjectSuggestion {
  title: string;
  description: string;
  skillsTargeted: string[];
  estimatedTime: number; // hours
  matchRelevance: number; // 1-10
}

// Generates a personalized improvement plan based on skills gap and available time.
export const generateImprovementPlan = api<GenerateImprovementPlanRequest, ImprovementPlan>(
  { expose: true, method: "POST", path: "/analysis/improvement-plan" },
  async (req) => {
    const weeksAvailable = Math.ceil(req.timeUntilInterview / 7);
    const hoursPerWeek = req.userAvailability === "full-time" ? 40 : 
                        req.userAvailability === "part-time" ? 20 : 10;

    const prioritizedSkills: PrioritizedSkill[] = req.skillsGap
      .filter(gap => gap.required || gap.priority === "high")
      .map(gap => ({
        skillName: gap.skillName,
        currentLevel: gap.userLevel,
        targetLevel: Math.min(gap.requiredLevel, gap.userLevel + 2), // Realistic improvement
        priority: gap.priority,
        estimatedTimeToImprove: (gap.requiredLevel - gap.userLevel) * 10 // 10 hours per level
      }))
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    const projectSuggestions: ProjectSuggestion[] = [
      {
        title: "Personal Portfolio Website",
        description: "Build a responsive portfolio showcasing your projects and skills",
        skillsTargeted: ["React", "TypeScript", "CSS"],
        estimatedTime: 30,
        matchRelevance: 8
      },
      {
        title: "Task Management API",
        description: "Create a RESTful API with authentication and database integration",
        skillsTargeted: ["Node.js", "Database Design", "API Development"],
        estimatedTime: 40,
        matchRelevance: 9
      },
      {
        title: "Real-time Chat Application",
        description: "Build a chat app with WebSocket integration and user management",
        skillsTargeted: ["WebSockets", "Real-time Systems", "Frontend"],
        estimatedTime: 50,
        matchRelevance: 7
      }
    ];

    // Generate timeline
    const timeline: TimelineItem[] = [];
    let currentWeek = 1;
    let remainingHours = weeksAvailable * hoursPerWeek;

    for (const skill of prioritizedSkills.slice(0, 3)) { // Focus on top 3 skills
      if (remainingHours <= 0 || currentWeek > weeksAvailable) break;

      const hoursThisWeek = Math.min(skill.estimatedTimeToImprove, hoursPerWeek, remainingHours);
      
      timeline.push({
        week: currentWeek,
        tasks: [{
          title: `Study ${skill.skillName}`,
          description: `Focus on improving ${skill.skillName} from level ${skill.currentLevel} to ${skill.targetLevel}`,
          estimatedHours: hoursThisWeek,
          skillsImproved: [skill.skillName]
        }]
      });

      remainingHours -= hoursThisWeek;
      if (hoursThisWeek < skill.estimatedTimeToImprove) {
        currentWeek++;
      }
    }

    const totalHoursNeeded = prioritizedSkills.reduce((sum, skill) => sum + skill.estimatedTimeToImprove, 0);
    const totalHoursAvailable = weeksAvailable * hoursPerWeek;
    const estimatedCompletionRate = Math.min(100, (totalHoursAvailable / totalHoursNeeded) * 100);

    return {
      timeline,
      prioritizedSkills,
      projectSuggestions,
      estimatedCompletionRate
    };
  }
);
