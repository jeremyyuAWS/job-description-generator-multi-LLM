import React, { useState } from 'react';
import { 
  Wand2, 
  RefreshCw, 
  ThumbsUp, 
  MessageSquare, 
  AlertCircle,
  PenTool,
  Feather,
  Sparkles,
  Loader2,
  BarChart,
  Check
} from 'lucide-react';
import { JobDescription, SectionType, ToneType, sectionLabels, LLMModelType } from '../types';
import { enhanceContent, rewriteContent } from '../services/aiService';
import { checkInclusivity, getInclusivityScore } from '../services/inclusivityService';
import RoleSummaryBuilder from './RoleSummaryBuilder';

interface CenterPanelProps {
  jobDescription: JobDescription;
  activeSection: SectionType;
  updateSection: (section: SectionType, content: string) => void;
  applySuggestion: (section: SectionType, suggestionIndex: number) => void;
  updateJobDescription: (data: Partial<JobDescription>) => void;
  selectedModel: LLMModelType;
}

const CenterPanel: React.FC<CenterPanelProps> = ({ 
  jobDescription, 
  activeSection,
  updateSection,
  applySuggestion,
  updateJobDescription,
  selectedModel
}) => {
  const [isEditing, setIsEditing] = useState(true);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateSection(activeSection, e.target.value);
  };

  const handleToneChange = (tone: ToneType) => {
    updateJobDescription({ tone });
  };

  const handleEnhanceContent = async () => {
    const currentContent = jobDescription.sections[activeSection].content;
    if (!currentContent || !jobDescription.title) return;
    
    setIsLoading('enhance');
    setLoadingStatus('Preparing to enhance content...');
    
    try {
      // Set loading status messages to show progress
      setLoadingStatus(`Connecting to Lyzr Agents (${selectedModel.toUpperCase()})...`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to show initial message
      
      setLoadingStatus('Analyzing current content...');
      await new Promise(resolve => setTimeout(resolve, 700)); // Another delay
      
      setLoadingStatus(`Enhancing job description with ${selectedModel.toUpperCase()}...`);
      const enhancedContent = await enhanceContent({
        jobTitle: jobDescription.title,
        seniority: jobDescription.seniority,
        employmentType: jobDescription.employmentType,
        remoteOption: jobDescription.remoteOption,
        section: activeSection,
        tone: jobDescription.tone,
        teamSize: jobDescription.teamSize,
        reportingTo: jobDescription.reportingTo,
        tools: jobDescription.tools,
        model: selectedModel
      }, currentContent);
      
      setLoadingStatus('Finalizing improvements...');
      await new Promise(resolve => setTimeout(resolve, 300)); // Final delay
      
      updateSection(activeSection, enhancedContent);
    } catch (error) {
      console.error('Error enhancing content:', error);
      setLoadingStatus('Error occurred while enhancing content.');
    } finally {
      // Clear loading status after a brief delay to show completion
      setTimeout(() => {
        setIsLoading(null);
        setLoadingStatus('');
      }, 500);
    }
  };

  const handleRewriteContent = async () => {
    const currentContent = jobDescription.sections[activeSection].content;
    if (!currentContent || !jobDescription.title) return;
    
    setIsLoading('rewrite');
    setLoadingStatus('Preparing to rewrite content...');
    
    try {
      // Set loading status messages to show progress
      setLoadingStatus(`Connecting to Lyzr Agents (${selectedModel.toUpperCase()})...`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
      
      setLoadingStatus(`Rewriting ${sectionLabels[activeSection]} with ${selectedModel.toUpperCase()}...`);
      await new Promise(resolve => setTimeout(resolve, 700)); // Another delay
      
      const rewrittenContent = await rewriteContent({
        jobTitle: jobDescription.title,
        seniority: jobDescription.seniority,
        employmentType: jobDescription.employmentType,
        remoteOption: jobDescription.remoteOption,
        section: activeSection,
        tone: jobDescription.tone,
        teamSize: jobDescription.teamSize,
        reportingTo: jobDescription.reportingTo,
        tools: jobDescription.tools,
        model: selectedModel
      }, currentContent);
      
      setLoadingStatus('Polishing final content...');
      await new Promise(resolve => setTimeout(resolve, 300)); // Final delay
      
      updateSection(activeSection, rewrittenContent);
    } catch (error) {
      console.error('Error rewriting content:', error);
      setLoadingStatus('Error occurred while rewriting content.');
    } finally {
      // Clear loading status after a brief delay to show completion
      setTimeout(() => {
        setIsLoading(null);
        setLoadingStatus('');
      }, 500);
    }
  };

  const handleApplySuggestion = (index: number) => {
    // Set the selected suggestion index to trigger animation
    setSelectedSuggestionIndex(index);
    setAnimationComplete(false);
    
    // Wait for animation to complete
    setTimeout(() => {
      // Apply the suggestion
      applySuggestion(activeSection, index);
      
      // Mark animation as complete to show success state
      setAnimationComplete(true);
      
      // Reset after a delay
      setTimeout(() => {
        setSelectedSuggestionIndex(null);
        setAnimationComplete(false);
        // Switch back to editing mode to see the applied content
        setIsEditing(true);
      }, 600);
    }, 600); // Match this with animation duration
  };

  const inclusivityIssues = checkInclusivity(jobDescription.sections[activeSection].content || '');
  const inclusivityScore = getInclusivityScore(jobDescription.sections[activeSection].content || '');
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get model-specific action label
  const getModelActionLabel = () => {
    switch (selectedModel) {
      case 'claude':
        return 'with Claude';
      case 'gpt4o':
        return 'with GPT-4o';
      case 'llama':
        return 'with LLaMA';
      default:
        return '';
    }
  };
  
  // Show specialized role summary builder when on summary section
  const isRoleSummarySection = activeSection === 'summary';
  
  return (
    <div className="w-full md:w-1/3 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          {sectionLabels[activeSection]}
        </h2>
        
        <div className="flex space-x-1 mt-2">
          <button 
            className={`px-3 py-1 text-xs rounded-md ${
              isEditing ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setIsEditing(true)}
          >
            <PenTool className="h-3 w-3 inline mr-1" />
            Editor
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-md ${
              !isEditing ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
            }`}
            onClick={() => setIsEditing(false)}
          >
            <Sparkles className="h-3 w-3 inline mr-1" />
            AI Suggestions
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="p-4 overflow-y-auto">
          {isRoleSummarySection ? (
            // Show specialized role summary builder for summary section
            <RoleSummaryBuilder
              jobTitle={jobDescription.title}
              seniority={jobDescription.seniority}
              employmentType={jobDescription.employmentType}
              remoteOption={jobDescription.remoteOption}
              teamSize={jobDescription.teamSize}
              reportingTo={jobDescription.reportingTo}
              tools={jobDescription.tools}
              tone={jobDescription.tone}
              currentContent={jobDescription.sections.summary.content}
              selectedModel={selectedModel}
              onUpdateContent={(content) => updateSection('summary', content)}
              onUpdateTone={handleToneChange}
              onSelectModel={(model) => updateJobDescription({ tone: jobDescription.tone })}
            />
          ) : (
            <div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  
                  {jobDescription.sections[activeSection].content && (
                    <div className="flex items-center text-sm">
                      <BarChart className="h-3 w-3 mr-1" />
                      <span className="mr-1">Inclusivity Score:</span>
                      <span className={`font-semibold ${getScoreColor(inclusivityScore)}`}>
                        {inclusivityScore}%
                      </span>
                    </div>
                  )}
                </div>
                
                <textarea
                  value={jobDescription.sections[activeSection].content}
                  onChange={handleTextareaChange}
                  className="w-full h-48 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={`Enter ${sectionLabels[activeSection]} content here...`}
                />
                
                {inclusivityIssues.length > 0 && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <h3 className="text-sm font-medium text-amber-800 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Inclusivity suggestions:
                    </h3>
                    <ul className="mt-1 text-xs text-amber-700 ml-5 list-disc">
                      {inclusivityIssues.map(({ term, suggestion, explanation }, index) => (
                        <li key={index} className="mb-1">
                          Consider replacing "<strong>{term}</strong>" with "<strong>{suggestion}</strong>"
                          {explanation && <div className="text-gray-600 text-xs mt-0.5">{explanation}</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tone Adjustment
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Professional', 'Friendly', 'Inclusive', 'Enthusiastic', 'Formal'].map((tone) => (
                    <button 
                      key={tone}
                      className={`px-3 py-1 text-xs rounded-full ${
                        jobDescription.tone === tone 
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleToneChange(tone as ToneType)}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  className={`flex items-center px-3 py-2 ${
                    isLoading === 'enhance' 
                      ? 'bg-indigo-100 text-indigo-500 cursor-not-allowed' 
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  } rounded-md text-sm font-medium`}
                  onClick={handleEnhanceContent}
                  disabled={isLoading !== null || !jobDescription.sections[activeSection].content || !jobDescription.title}
                >
                  {isLoading === 'enhance' ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-1" />
                  )}
                  {isLoading === 'enhance' ? 'Enhancing...' : `Enhance ${getModelActionLabel()}`}
                </button>
                <button 
                  className={`flex items-center px-3 py-2 ${
                    isLoading === 'rewrite' 
                      ? 'bg-green-100 text-green-500 cursor-not-allowed' 
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  } rounded-md text-sm font-medium`}
                  onClick={handleRewriteContent}
                  disabled={isLoading !== null || !jobDescription.sections[activeSection].content || !jobDescription.title}
                >
                  {isLoading === 'rewrite' ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  {isLoading === 'rewrite' ? 'Rewriting...' : `Rewrite ${getModelActionLabel()}`}
                </button>
                <button className="flex items-center px-3 py-2 bg-purple-50 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-100">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Ask AI
                </button>
              </div>
              
              {/* Real-time status message */}
              {isLoading && loadingStatus && (
                <div className="mt-3 p-2 bg-indigo-50 border border-indigo-100 rounded text-sm text-indigo-700 flex items-center">
                  <div className="animate-pulse h-2 w-2 bg-indigo-500 rounded-full mr-2"></div>
                  <span>{loadingStatus}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Wand2 className="h-4 w-4 mr-1" />
              AI-Generated Suggestions {selectedModel && `(${selectedModel.toUpperCase()})`}
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Select one of these suggestions to use in your job description:
            </p>
            
            {jobDescription.sections[activeSection].suggestions.length > 0 ? (
              <div className="space-y-3">
                {jobDescription.sections[activeSection].suggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className={`p-3 border rounded-md transition-all duration-300 ${
                      selectedSuggestionIndex === index 
                        ? animationComplete 
                          ? 'border-green-500 bg-green-50 scale-[0.98]' 
                          : 'border-indigo-500 bg-indigo-50 scale-95'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                    onClick={() => handleApplySuggestion(index)}
                  >
                    <div className="text-sm text-gray-700 whitespace-pre-line">{suggestion}</div>
                    <div className="mt-2 flex justify-end">
                      <button className={`text-xs ${
                        selectedSuggestionIndex === index 
                          ? animationComplete
                            ? 'text-green-600 flex items-center'
                            : 'text-indigo-600 flex items-center'
                          : 'text-indigo-600 hover:text-indigo-800 flex items-center'
                      }`}>
                        {selectedSuggestionIndex === index && animationComplete ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Applied Successfully
                          </>
                        ) : (
                          <>
                            <ThumbsUp className={`h-3 w-3 mr-1 ${
                              selectedSuggestionIndex === index && !animationComplete 
                                ? 'animate-bounce'
                                : ''
                            }`} />
                            Use this suggestion
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">
                  {!jobDescription.title 
                    ? "Enter a job title to generate suggestions." 
                    : "Loading suggestions..."}
                </p>
              </div>
            )}
            
            <div className="mt-4">
              <button className="flex items-center px-3 py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100">
                <RefreshCw className="h-4 w-4 mr-1" />
                Generate More Suggestions
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-auto p-4 bg-gray-50 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <h4 className="font-medium text-gray-700 mb-1">Smart Prompts:</h4>
          <div className="space-y-1">
            <p>• What specific skills are required for this position?</p>
            <p>• What career growth opportunities are available?</p>
            <p>• How would you describe your company culture?</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterPanel;