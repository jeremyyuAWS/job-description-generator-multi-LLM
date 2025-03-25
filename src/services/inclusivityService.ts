interface BiasedTerm {
  term: string;
  suggestion: string;
  explanation?: string;
}

/**
 * A comprehensive list of potentially biased terms and their inclusive alternatives
 */
export const biasedTerms: BiasedTerm[] = [
  // Gender-biased terms
  { term: 'he/she', suggestion: 'they', explanation: 'Gender-neutral pronoun that includes all gender identities' },
  { term: 'him/her', suggestion: 'them', explanation: 'Gender-neutral pronoun that includes all gender identities' },
  { term: 'his/her', suggestion: 'their', explanation: 'Gender-neutral pronoun that includes all gender identities' },
  { term: 'mankind', suggestion: 'humanity', explanation: 'Gender-neutral alternative' },
  { term: 'manpower', suggestion: 'workforce', explanation: 'Gender-neutral alternative' },
  { term: 'manmade', suggestion: 'artificial', explanation: 'Gender-neutral alternative' },
  { term: 'chairman', suggestion: 'chairperson', explanation: 'Gender-neutral job title' },
  { term: 'businessman', suggestion: 'business person', explanation: 'Gender-neutral job title' },
  { term: 'salesman', suggestion: 'salesperson', explanation: 'Gender-neutral job title' },
  { term: 'workmanship', suggestion: 'craftsmanship', explanation: 'Gender-neutral alternative' },
  { term: 'manning', suggestion: 'staffing', explanation: 'Gender-neutral alternative' },
  { term: 'man-hours', suggestion: 'person-hours', explanation: 'Gender-neutral alternative' },
  
  // Group-biased terms
  { term: 'guys', suggestion: 'team', explanation: 'Gender-neutral and more inclusive for all team members' },
  { term: 'girls', suggestion: 'women', explanation: 'More respectful when referring to adult women' },
  { term: 'ladies', suggestion: 'everyone', explanation: 'Gender-neutral and more inclusive for workplace settings' },
  
  // Age-biased terms
  { term: 'young and dynamic', suggestion: 'innovative', explanation: 'Avoids age discrimination' },
  { term: 'digital native', suggestion: 'proficient with technology', explanation: 'Avoids implicit age discrimination' },
  { term: 'recent graduate', suggestion: 'early-career professional', explanation: 'More inclusive of all early-career candidates' },
  
  // Ability-biased terms
  { term: 'blind spot', suggestion: 'oversight', explanation: 'Avoids ableist language' },
  { term: 'tone deaf', suggestion: 'insensitive', explanation: 'Avoids ableist language' },
  { term: 'stand-up meeting', suggestion: 'team meeting', explanation: 'More inclusive of team members with mobility considerations' },
  { term: 'wheelchair bound', suggestion: 'wheelchair user', explanation: 'Person-first language that avoids defining someone by disability' },
  
  // Cultural-biased terms
  { term: 'cultural fit', suggestion: 'values alignment', explanation: 'Focuses on shared principles rather than potentially exclusionary cultural matching' },
  { term: 'native speaker', suggestion: 'fluent', explanation: 'Focuses on skill level rather than origin' },
  
  // Race and ethnicity-biased terms
  { term: 'blacklist', suggestion: 'blocklist', explanation: 'Avoids terminology with racial connotations' },
  { term: 'whitelist', suggestion: 'allowlist', explanation: 'Avoids terminology with racial connotations' },
  { term: 'master', suggestion: 'primary', explanation: 'Avoids terminology with historical connections to slavery' },
  { term: 'slave', suggestion: 'secondary', explanation: 'Avoids terminology with historical connections to slavery' },
  
  // Socioeconomic-biased terms
  { term: 'blue collar', suggestion: 'manual labor', explanation: 'More descriptive of the actual work' },
  { term: 'white collar', suggestion: 'office-based', explanation: 'More descriptive of the actual work' }
];

/**
 * Checks text for inclusivity issues and returns found biased terms with suggestions
 */
export const checkInclusivity = (text: string): BiasedTerm[] => {
  if (!text) return [];
  
  const textLower = text.toLowerCase();
  const foundTerms = biasedTerms.filter(({ term }) => 
    textLower.includes(term.toLowerCase())
  );
  
  return foundTerms;
};

/**
 * Provides a score on the inclusivity of the text from 0-100
 */
export const getInclusivityScore = (text: string): number => {
  if (!text) return 100; // Empty text gets perfect score
  
  const issues = checkInclusivity(text);
  
  if (issues.length === 0) return 100;
  
  // Calculate score - deduct points based on number of issues
  // Base score is 100, deduct more points for more issues with diminishing impact
  const baseScore = 100;
  const deduction = Math.min(issues.length * 10, 50); // Cap at 50 points deduction
  
  return Math.max(baseScore - deduction, 0);
};

/**
 * Analyzes the overall inclusivity of the job description
 */
export const analyzeJobDescriptionInclusivity = (allText: string): {
  score: number;
  issues: BiasedTerm[];
  suggestions: string[];
} => {
  const issues = checkInclusivity(allText);
  const score = getInclusivityScore(allText);
  
  // Generate overall suggestions
  const suggestions: string[] = [];
  
  if (issues.length > 0) {
    suggestions.push('Consider replacing biased terms with inclusive alternatives');
  }
  
  // Look for masculine-coded language patterns
  const masculineWords = ['competitive', 'dominant', 'leader', 'ambitious', 'challenging'];
  const masculineMatches = masculineWords.filter(word => allText.toLowerCase().includes(word.toLowerCase()));
  
  if (masculineMatches.length >= 2) {
    suggestions.push('Your job description contains masculine-coded language that may discourage some candidates from applying');
  }
  
  // Check for overuse of requirements
  const requirementIndicators = ['must have', 'required', 'necessary', 'essential'];
  const requirementCount = requirementIndicators.reduce((count, word) => {
    const regex = new RegExp(word, 'gi');
    const matches = allText.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
  
  if (requirementCount > 10) {
    suggestions.push('Consider reducing the number of strict requirements to encourage a more diverse applicant pool');
  }
  
  return {
    score,
    issues,
    suggestions
  };
};