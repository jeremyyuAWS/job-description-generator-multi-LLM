import React, { useState, useEffect } from 'react';
import { SectionType, LLMModelType, llmModels } from '../types';
import { generateContent } from '../services/aiService';
import { Clock, Zap, BarChart2, Brain, Sparkles, CheckCircle, TrendingUp, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { analytics } from '../services/analytics';

interface LLMShowcaseProps {
  jobTitle: string;
  seniority: string;
  employmentType: string;
  remoteOption: string;
  selectedModel: LLMModelType;
  onSelectModel: (model: LLMModelType) => void;
}

const LLMShowcase: React.FC<LLMShowcaseProps> = ({
  jobTitle,
  seniority,
  employmentType,
  remoteOption,
  selectedModel,
  onSelectModel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showcaseSection, setShowcaseSection] = useState<SectionType>('summary');
  const [generatingModel, setGeneratingModel] = useState<LLMModelType | null>(null);
  const [showcaseResults, setShowcaseResults] = useState<Record<LLMModelType, {
    content: string;
    generationTime: number | null;
    wordCount: number;
  }>>({
    claude: { content: '', generationTime: null, wordCount: 0 },
    gpt4o: { content: '', generationTime: null, wordCount: 0 },
    llama: { content: '', generationTime: null, wordCount: 0 }
  });

  // Usage statistics display
  const [stats, setStats] = useState({
    totalGenerations: 0,
    avgResponseTime: {
      claude: 0,
      gpt4o: 0,
      llama: 0
    },
    usageDistribution: {
      claude: 0,
      gpt4o: 0,
      llama: 0
    }
  });

  useEffect(() => {
    // Update stats periodically
    const interval = setInterval(() => {
      updateStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    // Get actual analytics data
    const counts = analytics.getModelUsageCounts();
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    
    setStats({
      totalGenerations: total,
      avgResponseTime: {
        claude: analytics.getAverageResponseTime('claude'),
        gpt4o: analytics.getAverageResponseTime('gpt4o'),
        llama: analytics.getAverageResponseTime('llama')
      },
      usageDistribution: {
        claude: total ? (counts.claude / total) * 100 : 0,
        gpt4o: total ? (counts.gpt4o / total) * 100 : 0,
        llama: total ? (counts.llama / total) * 100 : 0
      }
    });
  };

  const toggleShowcase = () => {
    setIsOpen(!isOpen);
    if (!isOpen && jobTitle) {
      generateShowcaseContent();
    }
  };

  const generateShowcaseContent = async () => {
    if (!jobTitle) {
      alert('Please enter a job title to see a showcase of LLM capabilities');
      return;
    }

    // Generate content from all models for comparison
    for (const model of llmModels) {
      setGeneratingModel(model.id);
      
      const startTime = Date.now();
      try {
        const content = await generateContent({
          jobTitle,
          seniority,
          employmentType,
          remoteOption,
          section: showcaseSection,
          tone: 'Professional',
          model: model.id
        });
        
        const generationTime = Date.now() - startTime;
        const wordCount = content.split(/\s+/).length;
        
        setShowcaseResults(prev => ({
          ...prev,
          [model.id]: {
            content,
            generationTime,
            wordCount
          }
        }));
      } catch (error) {
        console.error(`Error generating showcase content for ${model.id}:`, error);
        setShowcaseResults(prev => ({
          ...prev,
          [model.id]: {
            content: 'Error generating content',
            generationTime: Date.now() - startTime,
            wordCount: 0
          }
        }));
      }
    }
    
    setGeneratingModel(null);
    updateStats();
  };

  const getModelIcon = (modelId: LLMModelType) => {
    switch (modelId) {
      case 'claude':
        return <Brain className="h-5 w-5 text-purple-500" />;
      case 'gpt4o':
        return <Sparkles className="h-5 w-5 text-green-500" />;
      case 'llama':
        return <Zap className="h-5 w-5 text-orange-500" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const handleSelectModel = (modelId: LLMModelType) => {
    onSelectModel(modelId);
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div 
        className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 flex items-center justify-between cursor-pointer"
        onClick={toggleShowcase}
      >
        <div className="flex items-center">
          <Activity className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="font-semibold text-indigo-800">LLM Showcase</h3>
          <span className="ml-2 text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full">
            Powered by Lyzr AI
          </span>
        </div>
        
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-indigo-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-indigo-500" />
        )}
      </div>
      
      {isOpen && (
        <div className="p-4">
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h4 className="text-base font-medium text-gray-800 mb-1">
                Compare AI Models in Real-Time
              </h4>
              <p className="text-sm text-gray-600">
                See how each model generates content for a {showcaseSection} based on the job details you've entered
              </p>
            </div>
            
            {/* Section selector */}
            <div className="mt-2 sm:mt-0">
              <select 
                value={showcaseSection}
                onChange={(e) => setShowcaseSection(e.target.value as SectionType)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="summary">Role Summary</option>
                <option value="responsibilities">Key Responsibilities</option>
                <option value="requiredQualifications">Required Qualifications</option>
                <option value="benefits">Benefits & Perks</option>
              </select>
            </div>
          </div>
          
          {/* Stats panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-indigo-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <TrendingUp className="h-4 w-4 text-indigo-500 mr-1" />
                <span className="text-xs font-medium text-indigo-700">Total Generations</span>
              </div>
              <p className="text-2xl font-semibold text-indigo-800">{stats.totalGenerations}</p>
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 text-indigo-500 mr-1" />
                <span className="text-xs font-medium text-indigo-700">Avg. Response Time</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {Object.entries(stats.avgResponseTime).map(([model, time]) => (
                  <div key={model} className="text-center">
                    <div className="text-xs text-indigo-700">{model}</div>
                    <div className="text-sm font-semibold text-indigo-800">
                      {time ? (time / 1000).toFixed(1) + 's' : '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg">
              <div className="flex items-center mb-1">
                <BarChart2 className="h-4 w-4 text-indigo-500 mr-1" />
                <span className="text-xs font-medium text-indigo-700">Usage Distribution</span>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden bg-gray-200 w-full">
                {stats.usageDistribution.claude > 0 && (
                  <div 
                    className="bg-purple-500 h-full" 
                    style={{ width: `${stats.usageDistribution.claude}%` }}
                    title={`Claude: ${stats.usageDistribution.claude.toFixed(1)}%`}
                  />
                )}
                {stats.usageDistribution.gpt4o > 0 && (
                  <div 
                    className="bg-green-500 h-full" 
                    style={{ width: `${stats.usageDistribution.gpt4o}%` }}
                    title={`GPT-4o: ${stats.usageDistribution.gpt4o.toFixed(1)}%`}
                  />
                )}
                {stats.usageDistribution.llama > 0 && (
                  <div 
                    className="bg-orange-500 h-full" 
                    style={{ width: `${stats.usageDistribution.llama}%` }}
                    title={`LLaMA: ${stats.usageDistribution.llama.toFixed(1)}%`}
                  />
                )}
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                <div className="text-xs text-purple-700 text-center">
                  Claude: {stats.usageDistribution.claude.toFixed(0)}%
                </div>
                <div className="text-xs text-green-700 text-center">
                  GPT-4o: {stats.usageDistribution.gpt4o.toFixed(0)}%
                </div>
                <div className="text-xs text-orange-700 text-center">
                  LLaMA: {stats.usageDistribution.llama.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
          
          {/* Model grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {llmModels.map((model) => (
              <div 
                key={model.id}
                className={`border rounded-lg p-4 ${
                  selectedModel === model.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                } hover:border-indigo-300 transition-colors`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {getModelIcon(model.id)}
                    <div className="ml-2">
                      <h4 className="font-medium text-gray-900">{model.name}</h4>
                      <p className="text-xs text-gray-500">{model.provider}</p>
                    </div>
                  </div>
                  {selectedModel === model.id ? (
                    <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Selected
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectModel(model.id)}
                      className="text-xs bg-white border border-indigo-300 text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-50"
                    >
                      Select
                    </button>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 mb-2">
                  {model.description}
                </p>
                <p className="text-xs font-medium text-indigo-600 mb-3">
                  {model.strengths}
                </p>
                
                <div className="bg-white border border-gray-200 rounded-md p-3 h-32 overflow-y-auto">
                  {generatingModel === model.id ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin h-5 w-5 border-b-2 border-indigo-600 rounded-full mx-auto mb-2"></div>
                        <p className="text-xs text-gray-500">Generating...</p>
                      </div>
                    </div>
                  ) : showcaseResults[model.id].content ? (
                    <div className="text-xs text-gray-800 whitespace-pre-line">
                      {showcaseResults[model.id].content}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-gray-500">
                      {jobTitle ? 'Click "Generate" to see output' : 'Enter a job title to generate content'}
                    </div>
                  )}
                </div>
                
                {showcaseResults[model.id].generationTime && (
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {(showcaseResults[model.id].generationTime / 1000).toFixed(1)}s
                    </span>
                    <span className="flex items-center">
                      <BarChart2 className="h-3 w-3 mr-1" />
                      {showcaseResults[model.id].wordCount} words
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center">
            <button 
              onClick={generateShowcaseContent}
              disabled={!jobTitle || generatingModel !== null}
              className={`px-4 py-2 rounded-md flex items-center ${
                !jobTitle || generatingModel !== null 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {generatingModel !== null ? (
                <>
                  <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></div>
                  Generating with {generatingModel}...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Comparison
                </>
              )}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Powered by Lyzr AI's unified LLM platform. Compare multiple models through a single, consistent API.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMShowcase;