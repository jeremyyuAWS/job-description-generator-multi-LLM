import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  Sparkles, 
  FileText, 
  Check, 
  ThumbsUp, 
  MessageSquare,
  Brain, 
  Zap,
  BarChart2,
  RefreshCw,
  Sliders,
  Target,
  Users,
  Briefcase,
  Clock,
  Shield,
  Loader2
} from 'lucide-react';
import { LLMModelType, ToneType } from '../types';
import { generateContent } from '../services/aiService';

interface RoleSummaryBuilderProps {
  jobTitle: string;
  seniority: string;
  employmentType: string;
  remoteOption: string;
  teamSize: string;
  reportingTo: string;
  tools: string;
  tone: ToneType;
  currentContent: string;
  selectedModel: LLMModelType;
  onUpdateContent: (content: string) => void;
  onUpdateTone: (tone: ToneType) => void;
  onSelectModel: (model: LLMModelType) => void;
}

interface SummaryVariation {
  id: string;
  content: string;
  focus: string;
  selected: boolean;
  modelUsed: LLMModelType;
}

const RoleSummaryBuilder: React.FC<RoleSummaryBuilderProps> = ({
  jobTitle,
  seniority,
  employmentType,
  remoteOption,
  teamSize,
  reportingTo,
  tools,
  tone,
  currentContent,
  selectedModel,
  onUpdateContent,
  onUpdateTone,
  onSelectModel
}) => {
  const [summaryFocus, setSummaryFocus] = useState<string>('balanced');
  const [variations, setVariations] = useState<SummaryVariation[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [modelResults, setModelResults] = useState<Record<LLMModelType, string>>({
    claude: '',
    gpt4o: '',
    llama: ''
  });
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [inlinePrompt, setInlinePrompt] = useState<string>('');
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);
  const [selectedModelResult, setSelectedModelResult] = useState<LLMModelType | null>(null);

  const focusOptions = [
    { id: 'balanced', name: 'Balanced', icon: <Target className="h-4 w-4" /> },
    { id: 'candidate-focused', name: 'Candidate Focused', icon: <Users className="h-4 w-4" /> },
    { id: 'company-focused', name: 'Company Focused', icon: <Briefcase className="h-4 w-4" /> },
    { id: 'impact-focused', name: 'Impact Focused', icon: <Zap className="h-4 w-4" /> },
    { id: 'growth-focused', name: 'Growth Focused', icon: <BarChart2 className="h-4 w-4" /> },
    { id: 'work-life-focused', name: 'Work-Life Balance', icon: <Clock className="h-4 w-4" /> },
    { id: 'values-focused', name: 'Values Focused', icon: <Shield className="h-4 w-4" /> }
  ];

  const getModelIcon = (model: LLMModelType) => {
    switch (model) {
      case 'claude':
        return <Brain className="h-4 w-4 text-purple-500" />;
      case 'gpt4o':
        return <Sparkles className="h-4 w-4 text-green-500" />;
      case 'llama':
        return <Zap className="h-4 w-4 text-orange-500" />;
      default:
        return <Wand2 className="h-4 w-4" />;
    }
  };

  const generateSummary = async () => {
    if (!jobTitle) {
      alert('Please enter a job title before generating a role summary');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus(`Starting generation with ${selectedModel}...`);

    try {
      const prompt = inlinePrompt ? 
        `Focus on: ${inlinePrompt}\n\nAdditional request: ${inlinePrompt}` : 
        `Focus on: ${summaryFocus}`;

      // Update status to show connecting to Lyzr Agents
      setGenerationStatus(`Connecting to Lyzr Agents (${selectedModel.toUpperCase()})...`);
      
      const content = await generateContent({
        jobTitle,
        seniority,
        employmentType,
        remoteOption,
        section: 'summary',
        tone,
        teamSize,
        reportingTo,
        tools,
        model: selectedModel,
        currentContent,
        action: currentContent ? 'enhance' : 'generate',
        additionalContext: prompt
      });

      const newVariation: SummaryVariation = {
        id: Date.now().toString(),
        content,
        focus: summaryFocus,
        selected: false,
        modelUsed: selectedModel
      };

      setVariations(prev => [...prev, newVariation]);
      setInlinePrompt('');
      
    } catch (error) {
      console.error('Error generating summary:', error);
      setGenerationStatus('Error generating summary. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  const generateComparisonSet = async () => {
    if (!jobTitle) {
      alert('Please enter a job title before comparing models');
      return;
    }

    setIsGenerating(true);
    setShowComparison(true);
    
    const newResults = { ...modelResults };
    
    // Generate with each model
    for (const model of ['claude', 'gpt4o', 'llama'] as LLMModelType[]) {
      try {
        setGenerationStatus(`Connecting to Lyzr Agents (${model.toUpperCase()})...`);
        
        const content = await generateContent({
          jobTitle,
          seniority,
          employmentType,
          remoteOption,
          section: 'summary',
          tone,
          teamSize,
          reportingTo,
          tools,
          model,
          additionalContext: `Focus on: ${summaryFocus}`
        });
        
        newResults[model] = content;
      } catch (error) {
        console.error(`Error generating summary with ${model}:`, error);
        newResults[model] = `Error generating content with ${model}. Please try again.`;
      }
    }
    
    setModelResults(newResults);
    setIsGenerating(false);
    setGenerationStatus('');
  };

  const selectVariation = (id: string) => {
    // Set selected variation ID for animation
    setSelectedVariationId(id);
    setAnimationComplete(false);
    
    // Wait for animation to complete
    setTimeout(() => {
      const selected = variations.find(v => v.id === id);
      if (selected) {
        onUpdateContent(selected.content);
        setVariations(variations.map(v => ({
          ...v,
          selected: v.id === id
        })));
      }
      
      // Show success state
      setAnimationComplete(true);
      
      // Reset after a delay
      setTimeout(() => {
        setSelectedVariationId(null);
        setAnimationComplete(false);
      }, 800);
    }, 400);
  };

  const handleModelResultSelect = (model: LLMModelType) => {
    // Set selected model for animation
    setSelectedModelResult(model);
    
    // Wait for animation to complete
    setTimeout(() => {
      onSelectModel(model);
      onUpdateContent(modelResults[model]);
      
      // Reset after a delay
      setTimeout(() => {
        setSelectedModelResult(null);
      }, 800);
    }, 400);
  };

  const handleCustomPrompt = () => {
    if (!inlinePrompt.trim()) return;
    
    generateSummary();
  };

  const getModelStrengths = (model: LLMModelType): string => {
    switch (model) {
      case 'claude':
        return 'Structured, clear, professional tone';
      case 'gpt4o':
        return 'Creative, engaging, nuanced language';
      case 'llama':
        return 'Direct, efficient, straightforward';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Role Summary Builder</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-xs flex items-center px-2 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {showComparison ? 'Hide Comparison' : 'Compare Models'}
          </button>
        </div>
      </div>

      {/* Focus options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Summary Focus
        </label>
        <div className="flex flex-wrap gap-2">
          {focusOptions.map(option => (
            <button
              key={option.id}
              className={`flex items-center px-2 py-1 text-xs rounded-md ${
                summaryFocus === option.id
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setSummaryFocus(option.id)}
            >
              {option.icon}
              <span className="ml-1">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom prompt input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Custom Instructions (Optional)
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={inlinePrompt}
            onChange={(e) => setInlinePrompt(e.target.value)}
            placeholder="E.g., Emphasize teamwork and collaboration..."
            className="flex-grow p-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={handleCustomPrompt}
            disabled={isGenerating || !inlinePrompt.trim()}
            className={`px-3 py-1 text-sm rounded-md ${
              isGenerating || !inlinePrompt.trim() 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Generate button row */}
      <div className="flex space-x-2 pt-2">
        <button
          onClick={generateSummary}
          disabled={isGenerating || !jobTitle}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            isGenerating || !jobTitle
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              {getModelIcon(selectedModel)}
              <span className="ml-2">Generate with {selectedModel.toUpperCase()}</span>
            </>
          )}
        </button>
        <button
          onClick={generateComparisonSet}
          disabled={isGenerating || !jobTitle}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            isGenerating || !jobTitle
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          <Sliders className="h-4 w-4 mr-2" />
          Compare All Models
        </button>
      </div>

      {/* Status message */}
      {generationStatus && (
        <div className="text-sm text-indigo-600 flex items-center">
          <div className="animate-spin h-3 w-3 border-b-2 border-indigo-600 rounded-full mr-2"></div>
          {generationStatus}
        </div>
      )}

      {/* Model comparison view */}
      {showComparison && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Model Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(modelResults).map(([model, content]) => (
              <div 
                key={model}
                className={`border rounded-lg p-3 transition-all duration-300 ${
                  selectedModel === model 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : selectedModelResult === model
                      ? 'border-indigo-400 bg-indigo-50 scale-95'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getModelIcon(model as LLMModelType)}
                    <span className="ml-1 font-medium">
                      {model === 'claude' ? 'Claude' : 
                       model === 'gpt4o' ? 'GPT-4o' : 'LLaMA'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleModelResultSelect(model as LLMModelType)}
                    className={`text-xs px-2 py-0.5 rounded transition-colors duration-300 ${
                      selectedModel === model
                        ? 'bg-indigo-200 text-indigo-700'
                        : selectedModelResult === model
                          ? 'bg-green-100 text-green-700'
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    }`}
                  >
                    {selectedModel === model ? (
                      <>
                        <Check className="h-3 w-3 inline mr-1" />
                        Selected
                      </>
                    ) : (
                      'Use This'
                    )}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  {getModelStrengths(model as LLMModelType)}
                </div>
                <div className="h-32 overflow-y-auto p-2 bg-white border border-gray-100 rounded text-sm text-gray-800">
                  {content || (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <span>Click "Compare All Models" to generate</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Previous variations */}
      {variations.length > 0 && (
        <div className="mt-4 pt-2 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Variations</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {variations.map((variation) => (
              <div 
                key={variation.id} 
                className={`border rounded-lg p-3 cursor-pointer transition-all duration-300 ${
                  variation.selected 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : selectedVariationId === variation.id
                      ? animationComplete
                        ? 'border-green-500 bg-green-50 scale-[0.98]'
                        : 'border-indigo-400 bg-indigo-50 scale-95'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
                onClick={() => selectVariation(variation.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    {getModelIcon(variation.modelUsed)}
                    <span className="ml-1 text-xs font-medium">
                      {variation.modelUsed === 'claude' ? 'Claude' : 
                       variation.modelUsed === 'gpt4o' ? 'GPT-4o' : 'LLaMA'}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      Focus: {variation.focus}
                    </span>
                  </div>
                  {variation.selected ? (
                    <span className="text-xs text-green-600 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Selected
                    </span>
                  ) : selectedVariationId === variation.id && animationComplete ? (
                    <span className="text-xs text-green-600 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Applied
                    </span>
                  ) : (
                    <span className="text-xs text-indigo-600 flex items-center">
                      <ThumbsUp className={`h-3 w-3 mr-1 ${
                        selectedVariationId === variation.id && !animationComplete 
                          ? 'animate-bounce'
                          : ''
                      }`} />
                      Use this
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-800">
                  {variation.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tone adjustment */}
      <div className="mt-3 pt-3 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tone Adjustment
        </label>
        <div className="flex flex-wrap gap-2">
          {['Professional', 'Friendly', 'Inclusive', 'Enthusiastic', 'Formal'].map((toneOption) => (
            <button 
              key={toneOption}
              className={`px-3 py-1 text-xs rounded-full ${
                tone === toneOption 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => onUpdateTone(toneOption as ToneType)}
            >
              {toneOption}
            </button>
          ))}
        </div>
      </div>

      {/* AI suggestions based on model */}
      <div className="mt-3 pt-3 border-t">
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 text-indigo-500 mr-1" />
          <h4 className="text-sm font-medium text-gray-700">Role Summary Tips</h4>
        </div>
        <ul className="text-xs text-gray-600 mt-1 ml-5 space-y-1">
          <li className="list-disc">Start with a compelling opener that grabs attention</li>
          <li className="list-disc">Balance company needs with what candidates are looking for</li>
          <li className="list-disc">Keep it concise (3-5 sentences) but impactful</li>
          <li className="list-disc">Highlight growth opportunities and impact of the role</li>
          <li className="list-disc">Use active voice and inclusive language</li>
        </ul>

        <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-600">
          <p className="font-medium text-indigo-700 mb-1">Model-specific Tips:</p>
          {selectedModel === 'claude' && (
            <p>Claude excels at creating structured, professional summaries with clear organization and formal language. Great for traditional industries.</p>
          )}
          {selectedModel === 'gpt4o' && (
            <p>GPT-4o creates creative, engaging summaries with nuanced language. Excellent for marketing, creative fields, and when you want to stand out.</p>
          )}
          {selectedModel === 'llama' && (
            <p>LLaMA produces concise, direct summaries efficiently. Perfect for technical roles and when you need straightforward, no-frills descriptions.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSummaryBuilder;