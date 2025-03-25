import React, { useState, useEffect } from 'react';
import { BookOpenCheck, FileDown, Link, ClipboardCopy, Zap, Wand2 } from 'lucide-react';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import Footer from './components/Footer';
import TemplateSelector from './components/TemplateSelector';
import ModelSelector from './components/ModelSelector';
import LLMShowcase from './components/LLMShowcase';
import Dashboard from './pages/Dashboard';
import ModelSelectionModal from './components/ModelSelectionModal';
import IntroOverlay from './components/IntroOverlay';
import { JobDescription, SectionType, ToneType, LLMModelType } from './types';
import { generateContent } from './services/aiService';
import { useDevTools } from './context/DevToolsContext';

function App() {
  const devToolsContext = useDevTools();
  const { isEnabled } = devToolsContext;
  const [jobDescription, setJobDescription] = useState<JobDescription>({
    title: '',
    seniority: 'Mid-Level',
    employmentType: 'Full-Time',
    remoteOption: 'On-Site',
    teamSize: '',
    reportingTo: '',
    tools: '',
    sections: {
      summary: { content: '', suggestions: [] },
      responsibilities: { content: '', suggestions: [] },
      requiredQualifications: { content: '', suggestions: [] },
      preferredQualifications: { content: '', suggestions: [] },
      benefits: { content: '', suggestions: [] },
      companyBlurb: { content: '', suggestions: [] },
    },
    tone: 'Professional',
  });

  const [activeSection, setActiveSection] = useState<SectionType>('summary');
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedModel, setSelectedModel] = useState<LLMModelType>('claude');
  
  // New state for enhanced UI
  const [showDashboard, setShowDashboard] = useState(true);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showIntroOverlay, setShowIntroOverlay] = useState(true);

  // Make DevTools context available to the aiService
  useEffect(() => {
    if (isEnabled) {
      window.devToolsContext = devToolsContext;
    }
  }, [isEnabled, devToolsContext]);

  // Generate AI suggestions when the job title changes or when seniority/tone is updated
  useEffect(() => {
    if (jobDescription.title && !isGeneratingSuggestions) {
      // Only generate if we have a title
      setIsGeneratingSuggestions(true);
      setGenerationStatus('Preparing to generate suggestions...');
      
      // Simulate API call delay
      const timer = setTimeout(async () => {
        try {
          await generateSuggestions();
        } finally {
          setIsGeneratingSuggestions(false);
          setGenerationStatus('');
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [jobDescription.title, jobDescription.seniority, jobDescription.tone, selectedModel]);

  const generateSuggestions = async () => {
    if (!jobDescription.title) return;
    
    const updatedSections = { ...jobDescription.sections };
    
    // Array of promises for each section's suggestions
    const sectionPromises = Object.keys(updatedSections).map(async (key) => {
      const section = key as SectionType;
      
      // Skip sections that already have content
      if (updatedSections[section].content) return;
      
      try {
        // Update status message for current section
        setGenerationStatus(`Generating ${section} suggestions with ${selectedModel.toUpperCase()}...`);
        
        // Use either the real AI service or fallback to mock suggestions
        const suggestions = [];
        for (let i = 0; i < 3; i++) {
          try {
            setGenerationStatus(`Connecting to Lyzr Agents (${selectedModel.toUpperCase()}) (${i+1}/3)...`);
            const content = await generateContent({
              jobTitle: jobDescription.title,
              seniority: jobDescription.seniority,
              employmentType: jobDescription.employmentType,
              remoteOption: jobDescription.remoteOption,
              section,
              tone: jobDescription.tone,
              teamSize: jobDescription.teamSize,
              reportingTo: jobDescription.reportingTo,
              tools: jobDescription.tools,
              model: selectedModel
            });
            suggestions.push(content);
            
            // Update status to show progress
            setGenerationStatus(`Generated suggestion ${i+1}/3 for ${section} with ${selectedModel.toUpperCase()}...`);
          } catch (error) {
            // If AI generation fails, fallback to mock data
            setGenerationStatus(`Using fallback data for ${section}...`);
            const mockSuggestions = generateMockSuggestions(
              jobDescription.title,
              section,
              jobDescription.seniority,
              jobDescription.tone
            );
            suggestions.push(mockSuggestions[i % mockSuggestions.length]);
          }
          
          // Small delay between generation calls to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        updatedSections[section].suggestions = suggestions;
      } catch (error) {
        console.error(`Error generating suggestions for ${section}:`, error);
        // Fallback to mock suggestions
        setGenerationStatus(`Error occurred. Using fallback data for ${section}...`);
        updatedSections[section].suggestions = generateMockSuggestions(
          jobDescription.title,
          section,
          jobDescription.seniority,
          jobDescription.tone
        );
      }
    });
    
    try {
      setGenerationStatus('Processing all suggestions...');
      await Promise.all(sectionPromises);
      setJobDescription({
        ...jobDescription,
        sections: updatedSections,
      });
      setGenerationStatus('All suggestions generated successfully!');
      
      // Clear status after a short delay to show completion message
      setTimeout(() => setGenerationStatus(''), 1500);
    } catch (error) {
      console.error("Error generating all suggestions:", error);
      setGenerationStatus('Failed to generate some suggestions.');
      
      // Clear error message after a delay
      setTimeout(() => setGenerationStatus(''), 3000);
    }
  };

  const updateJobDescription = (updatedData: Partial<JobDescription>) => {
    setJobDescription({ ...jobDescription, ...updatedData });
  };

  const updateSection = (sectionType: SectionType, content: string) => {
    const updatedSections = { 
      ...jobDescription.sections,
      [sectionType]: { 
        ...jobDescription.sections[sectionType],
        content 
      }
    };
    
    setJobDescription({
      ...jobDescription,
      sections: updatedSections,
    });
  };

  const applySuggestion = (sectionType: SectionType, suggestionIndex: number) => {
    const suggestion = jobDescription.sections[sectionType].suggestions[suggestionIndex];
    updateSection(sectionType, suggestion);
  };

  const handleApplyTemplate = (templateJobDescription: JobDescription) => {
    // Preserve existing template suggestions if any are present
    const newSections = { ...templateJobDescription.sections };
    Object.keys(newSections).forEach(key => {
      const sectionKey = key as SectionType;
      const existingSuggestions = jobDescription.sections[sectionKey].suggestions;
      if (existingSuggestions.length > 0) {
        newSections[sectionKey] = {
          ...newSections[sectionKey],
          suggestions: existingSuggestions
        };
      }
    });

    // Apply the template
    setJobDescription({
      ...templateJobDescription,
      sections: newSections
    });
    
    // Close the dashboard after applying a template
    setShowDashboard(false);
  };

  const handleModelChange = (model: LLMModelType) => {
    setSelectedModel(model);
    // When model changes, we'll regenerate suggestions if the job title exists
    if (jobDescription.title) {
      // Clear existing suggestions to force regeneration with the new model
      const updatedSections = { ...jobDescription.sections };
      Object.keys(updatedSections).forEach(key => {
        const sectionKey = key as SectionType;
        if (!updatedSections[sectionKey].content) {
          updatedSections[sectionKey].suggestions = [];
        }
      });
      
      setJobDescription({
        ...jobDescription,
        sections: updatedSections
      });
    }
  };

  const generateMockSuggestions = (title: string, section: SectionType, seniority: string, tone: ToneType): string[] => {
    // This is a fallback for when the AI service is unavailable
    const suggestions: Record<SectionType, string[]> = {
      summary: [
        `We are seeking a ${seniority} ${title} to join our growing team. In this role, you will be responsible for developing and implementing strategies to achieve our business goals.`,
        `An exciting opportunity for a ${seniority} ${title} who is passionate about making an impact. You'll work with cross-functional teams to drive innovation and excellence.`,
        `Join our team as a ${seniority} ${title} where you'll leverage your expertise to solve complex problems and contribute to our company's success.`
      ],
      responsibilities: [
        `• Lead and execute ${title}-related projects\n• Collaborate with cross-functional teams\n• Analyze data and present findings\n• Develop and implement strategies\n• Monitor performance metrics`,
        `• Design and develop solutions for complex business problems\n• Work closely with stakeholders to understand requirements\n• Provide expertise and guidance to junior team members\n• Contribute to process improvements`,
        `• Drive key initiatives related to the ${title} role\n• Create reports and presentations for leadership\n• Identify opportunities for optimization\n• Manage relationships with key partners`
      ],
      requiredQualifications: [
        `• ${seniority === 'Senior' ? '5+' : seniority === 'Mid-Level' ? '2-4' : '1-2'} years of experience in a similar role\n• Bachelor's degree in a relevant field\n• Strong analytical and problem-solving skills\n• Excellent communication abilities\n• Proficiency with industry tools`,
        `• Proven track record in ${title.toLowerCase()} functions\n• Experience with data analysis and reporting\n• Ability to work independently and as part of a team\n• Strong attention to detail\n• Time management and organizational skills`,
        `• Experience with ${title.toLowerCase()}-related tools and methodologies\n• Knowledge of industry best practices\n• Ability to manage multiple projects\n• Strong interpersonal skills\n• Problem-solving mindset`
      ],
      preferredQualifications: [
        `• Advanced degree in a relevant field\n• Experience with project management\n• Knowledge of emerging industry trends\n• Leadership experience\n• Additional certifications relevant to the role`,
        `• Experience with data visualization tools\n• Background in a similar industry\n• Multilingual capabilities\n• Experience working in agile environments\n• Portfolio of relevant projects`,
        `• Advanced proficiency in specialized tools\n• Public speaking experience\n• Published work in relevant fields\n• Experience mentoring junior team members\n• International work experience`
      ],
      benefits: [
        `• Competitive salary and bonus structure\n• Comprehensive health, dental, and vision insurance\n• 401(k) matching program\n• Professional development opportunities\n• Flexible work arrangements`,
        `• Health and wellness benefits\n• Generous paid time off\n• Company-sponsored events and team building\n• Career advancement opportunities\n• Employee recognition programs`,
        `• Work-life balance initiatives\n• Remote work options\n• Continuing education reimbursement\n• Stock options\n• Parental leave benefits`
      ],
      companyBlurb: [
        `At our company, we're on a mission to transform the industry through innovation and excellence. We value collaboration, integrity, and growth, creating an environment where employees can thrive.`,
        `We are a forward-thinking organization committed to making a positive impact on our community and industry. Our team is passionate about what we do and strives for excellence in every endeavor.`,
        `Founded with a vision to revolutionize the way people experience our products and services, our company has grown into a leader in our field. We foster a culture of creativity and continuous improvement.`
      ]
    };
    
    return suggestions[section];
  };

  // If showing the dashboard, render it instead of the main app
  if (showDashboard) {
    return (
      <Dashboard 
        onNavigateToMainApp={() => setShowDashboard(false)}
        onSelectModel={handleModelChange}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {showIntroOverlay && <IntroOverlay onClose={() => setShowIntroOverlay(false)} />}
      
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex items-center">
          <BookOpenCheck className="h-8 w-8 text-indigo-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">HireWrite</h1>
          <p className="ml-3 text-sm text-gray-500">Craft the perfect job description, powered by AI.</p>
          <div className="ml-auto flex items-center space-x-3">
            <button
              onClick={() => setShowModelModal(true)}
              className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
            >
              <Zap className="h-4 w-4 mr-1" />
              Switch LLM
            </button>
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="inline-flex items-center px-3 py-2 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
            >
              <FileDown className="h-4 w-4 mr-1" />
              Templates
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {isGeneratingSuggestions && generationStatus && (
          <div className="absolute top-16 right-4 z-50 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-md shadow-md flex items-center border border-indigo-200">
            <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full mr-2"></div>
            <span className="text-sm font-medium">{generationStatus}</span>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          <LeftPanel 
            jobDescription={jobDescription}
            updateJobDescription={updateJobDescription}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
          
          <CenterPanel 
            jobDescription={jobDescription}
            activeSection={activeSection}
            updateSection={updateSection}
            applySuggestion={applySuggestion}
            updateJobDescription={updateJobDescription}
            selectedModel={selectedModel}
          />
          
          <RightPanel jobDescription={jobDescription} />
        </div>
      </main>

      {/* LLM Showcase Component */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="container mx-auto">
          <LLMShowcase
            jobTitle={jobDescription.title}
            seniority={jobDescription.seniority}
            employmentType={jobDescription.employmentType}
            remoteOption={jobDescription.remoteOption}
            selectedModel={selectedModel}
            onSelectModel={handleModelChange}
          />
        </div>
      </div>

      <Footer jobDescription={jobDescription} selectedModel={selectedModel} />

      {showTemplateSelector && (
        <TemplateSelector 
          onSelectTemplate={handleApplyTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
      
      {showModelModal && (
        <ModelSelectionModal
          isOpen={showModelModal}
          onClose={() => setShowModelModal(false)}
          selectedModel={selectedModel}
          onSelectModel={handleModelChange}
        />
      )}
    </div>
  );
}

export default App;