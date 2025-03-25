import React, { useState } from 'react';
import { X, BarChart2, Zap, TrendingUp, ChevronRight, Brain, Sparkles } from 'lucide-react';
import { LLMModelType, llmModels } from '../types';
import { analytics } from '../services/analytics';

interface ModelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: LLMModelType;
  onSelectModel: (model: LLMModelType) => void;
}

const ModelSelectionModal: React.FC<ModelSelectionModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel
}) => {
  const [activeTab, setActiveTab] = useState<'models' | 'compare'>('models');
  
  // Model comparison data
  const comparisonData = {
    speed: {
      claude: 70,
      gpt4o: 65,
      llama: 95
    },
    quality: {
      claude: 90,
      gpt4o: 95,
      llama: 75
    },
    structure: {
      claude: 95,
      gpt4o: 85,
      llama: 75
    },
    creativity: {
      claude: 80,
      gpt4o: 95,
      llama: 70
    }
  };
  
  // Usage statistics
  const usageStats = {
    totalRequests: analytics.getModelUsageCounts().claude + 
                  analytics.getModelUsageCounts().gpt4o + 
                  analytics.getModelUsageCounts().llama,
    distribution: {
      claude: analytics.getModelUsageCounts().claude,
      gpt4o: analytics.getModelUsageCounts().gpt4o,
      llama: analytics.getModelUsageCounts().llama
    },
    avgResponseTime: {
      claude: analytics.getAverageResponseTime('claude'),
      gpt4o: analytics.getAverageResponseTime('gpt4o'),
      llama: analytics.getAverageResponseTime('llama')
    }
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
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">LLM Model Selection</h2>
            <p className="text-sm text-gray-500">
              Choose the AI model that best fits your needs
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'models' 
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('models')}
          >
            Available Models
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'compare' 
                ? 'text-indigo-600 border-b-2 border-indigo-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('compare')}
          >
            Compare Performance
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4">
          {activeTab === 'models' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {llmModels.map(model => (
                <div 
                  key={model.id}
                  className={`border rounded-lg p-4 hover:border-indigo-300 cursor-pointer ${
                    selectedModel === model.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  }`}
                  onClick={() => onSelectModel(model.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {getModelIcon(model.id)}
                      <div className="ml-2">
                        <h3 className="font-medium text-gray-900">{model.name}</h3>
                        <p className="text-xs text-gray-500">{model.provider}</p>
                      </div>
                    </div>
                    
                    {selectedModel === model.id && (
                      <span className="flex items-center text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                  <p className="text-sm font-medium text-indigo-600 mb-3">{model.strengths}</p>
                  
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Typical Response Time</span>
                        <span className="text-xs font-medium">
                          {usageStats.avgResponseTime[model.id] 
                            ? (usageStats.avgResponseTime[model.id] / 1000).toFixed(1) + 's'
                            : 'No data'}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            model.id === 'claude' ? 'bg-purple-500' : 
                            model.id === 'gpt4o' ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(100, (usageStats.avgResponseTime[model.id] || 0) / 50)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Usage Count</span>
                        <span className="text-xs font-medium">{usageStats.distribution[model.id] || 0}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            model.id === 'claude' ? 'bg-purple-500' : 
                            model.id === 'gpt4o' ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                          style={{ 
                            width: `${usageStats.totalRequests 
                              ? (usageStats.distribution[model.id] / usageStats.totalRequests) * 100 
                              : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <button
                      className={`w-full py-2 text-sm rounded-md ${
                        selectedModel === model.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                      }`}
                      onClick={() => onSelectModel(model.id)}
                    >
                      {selectedModel === model.id ? 'Currently Selected' : 'Select This Model'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'compare' && (
            <div>
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-800 mb-2">Performance Comparison</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Compare the strengths and weaknesses of each LLM model for different tasks
                </p>
                
                <div className="space-y-4">
                  {Object.entries(comparisonData).map(([metric, values]) => (
                    <div key={metric}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 capitalize">{metric}</span>
                        <div className="flex space-x-4 text-xs">
                          <span className="text-purple-600">Claude</span>
                          <span className="text-green-600">GPT-4o</span>
                          <span className="text-orange-600">LLaMA</span>
                        </div>
                      </div>
                      <div className="relative h-8 bg-gray-100 rounded-md">
                        <div 
                          className="absolute top-0 left-0 h-full bg-purple-500 rounded-l-md"
                          style={{ width: `${values.claude}%` }}
                        ></div>
                        <div 
                          className="absolute top-0 left-0 h-full bg-green-500"
                          style={{ width: `${values.gpt4o}%`, marginLeft: '1px' }}
                        ></div>
                        <div 
                          className="absolute top-0 left-0 h-full bg-orange-500 rounded-r-md"
                          style={{ width: `${values.llama}%`, marginLeft: '2px' }}
                        ></div>
                        
                        <div className="absolute inset-0 flex items-center justify-between px-2">
                          <span className="text-white text-xs font-medium">{values.claude}%</span>
                          <span className="text-white text-xs font-medium">{values.gpt4o}%</span>
                          <span className="text-white text-xs font-medium">{values.llama}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base font-medium text-gray-800 mb-3">Recommended Use Cases</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 border border-purple-100 p-3 rounded-md">
                    <div className="flex items-center mb-2">
                      <Brain className="h-5 w-5 text-purple-500 mr-2" />
                      <h4 className="font-medium text-purple-800">Claude 3.5 Sonnet</h4>
                    </div>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Professional documentation</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Structured content with clear organization</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Factual, methodical writing</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-100 p-3 rounded-md">
                    <div className="flex items-center mb-2">
                      <Sparkles className="h-5 w-5 text-green-500 mr-2" />
                      <h4 className="font-medium text-green-800">GPT-4o</h4>
                    </div>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Creative marketing copy</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Nuanced, context-aware responses</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Complex problem solving</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-100 p-3 rounded-md">
                    <div className="flex items-center mb-2">
                      <Zap className="h-5 w-5 text-orange-500 mr-2" />
                      <h4 className="font-medium text-orange-800">LLaMA 3.3 70B</h4>
                    </div>
                    <ul className="text-sm text-orange-800 space-y-1">
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Quick drafts and iterations</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Straightforward content generation</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>High-volume tasks with lower costs</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-between bg-gray-50">
          <div className="text-sm text-gray-500 flex items-center">
            <BarChart2 className="h-4 w-4 mr-1 text-indigo-500" />
            <span>Powered by Lyzr's Multi-LLM Platform</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelSelectionModal;