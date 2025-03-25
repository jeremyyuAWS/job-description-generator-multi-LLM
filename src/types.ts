export type SeniorityLevel = 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Manager' | 'Director' | 'Executive';
export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
export type RemoteOption = 'Remote' | 'Hybrid' | 'On-Site';
export type ToneType = 'Professional' | 'Friendly' | 'Inclusive' | 'Enthusiastic' | 'Formal';
export type SectionType = 'summary' | 'responsibilities' | 'requiredQualifications' | 'preferredQualifications' | 'benefits' | 'companyBlurb';

// Define LLM model types
export type LLMModelType = 'claude' | 'gpt4o' | 'llama';

export interface LLMModel {
  id: LLMModelType;
  name: string;
  provider: string;
  description: string;
  strengths: string;
}

export const llmModels: LLMModel[] = [
  {
    id: 'claude',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Human-like writing, excels at structure, clear prose',
    strengths: 'Strong on professional tone'
  },
  {
    id: 'gpt4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Very smart, great at nuance, works well with role-based prompts',
    strengths: 'More creative & polished'
  },
  {
    id: 'llama',
    name: 'LLaMA 3.3 70B',
    provider: 'Groq',
    description: 'Fast, solid output, lower cost',
    strengths: 'Great for fast iterations'
  }
];

export interface SectionContent {
  content: string;
  suggestions: string[];
}

export interface JobDescriptionSections {
  summary: SectionContent;
  responsibilities: SectionContent;
  requiredQualifications: SectionContent;
  preferredQualifications: SectionContent;
  benefits: SectionContent;
  companyBlurb: SectionContent;
}

export interface JobDescription {
  title: string;
  seniority: SeniorityLevel;
  employmentType: EmploymentType;
  remoteOption: RemoteOption;
  teamSize: string;
  reportingTo: string;
  tools: string;
  sections: JobDescriptionSections;
  tone: ToneType;
}

export interface LLMGenerationParams {
  jobTitle: string;
  seniority: string;
  employmentType: string;
  remoteOption: string;
  section: SectionType;
  tone: ToneType;
  teamSize?: string;
  reportingTo?: string;
  tools?: string;
  model?: LLMModelType;
  currentContent?: string;
  action?: 'generate' | 'enhance' | 'rewrite';
  additionalContext?: string;
}

export const sectionLabels: Record<SectionType, string> = {
  summary: 'Role Summary',
  responsibilities: 'Key Responsibilities',
  requiredQualifications: 'Required Qualifications',
  preferredQualifications: 'Preferred Qualifications',
  benefits: 'Benefits & Perks',
  companyBlurb: 'Company Description'
};

// Global type extensions
declare global {
  interface Window {
    devToolsContext?: any;
  }
}