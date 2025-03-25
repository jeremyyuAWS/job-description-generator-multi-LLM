import React, { useState, useEffect } from 'react';
import { BarChart, TrendingUp, ArrowRight, Zap, Cpu, Sparkles, BookOpenCheck } from 'lucide-react';
import { LLMModelType, llmModels } from '../types';
import { analytics } from '../services/analytics';

interface DashboardProps {
  onNavigateToMainApp: () => void;
  onSelectModel: (model: LLMModelType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToMainApp, onSelectModel }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'learn'>('overview');
  const [selectedModel, setSelectedModel] = useState<LLMModelType>('claude');
  
  // Sample performance data
  const [performanceData, setPerformanceData] = useState({
    claude: { 
      speed: 85, 
      accuracy: 92, 
      creativity: 88, 
      structure: 95,
      bestFor: ['Professional documentation', 'Structured content', 'Legal writing']
    },
    gpt4o: { 
      speed: 82, 
      accuracy: 94, 
      creativity: 96, 
      structure: 90,
      bestFor: ['Creative writing', 'Nuanced responses', 'Complex reasoning']
    },
    llama: { 
      speed: 98, 
      accuracy: 88, 
      creativity: 82, 
      structure: 85,
      bestFor: ['Fast iterations', 'Simple responses', 'High throughput needs']
    }
  });

  // Sample usage statistics
  const [usageStats, setUsageStats] = useState({
    totalGenerations: 0,
    modelDistribution: {
      claude: 0,
      gpt4o: 0,
      llama: 0
    },
    responseTime: {
      claude: 0,
      gpt4o: 0,
      llama: 0
    }
  });

  useEffect(() => {
    // Update usage statistics
    updateStats();
    
    // Set up periodic updates
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    // Get data from analytics service
    const counts = analytics.getModelUsageCounts();
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    
    setUsageStats({
      totalGenerations: total,
      modelDistribution: {
        claude: total ? (counts.claude / total) * 100 : 0,
        gpt4o: total ? (counts.gpt4o / total) * 100 : 0,
        llama: total ? (counts.llama / total) * 100 : 0
      },
      responseTime: {
        claude: analytics.getAverageResponseTime('claude'),
        gpt4o: analytics.getAverageResponseTime('gpt4o'),
        llama: analytics.getAverageResponseTime('llama')
      }
    });
  };

  const handleModelSelect = (model: LLMModelType) => {
    setSelectedModel(model);
    onSelectModel(model);
    
    // Navigate to the main app with a short delay to show the selection
    setTimeout(() => {
      onNavigateToMainApp();
    }, 500);
  };

  const getModelIcon = (modelId: LLMModelType) => {
    switch (modelId) {
      case 'claude':
        return <Cpu className="h-6 w-6 text-purple-500" />;
      case 'gpt4o':
        return <Sparkles className="h-6 w-6 text-green-500" />;
      case 'llama':
        return <Zap className="h-6 w-6 text-orange-500" />;
      default:
        return <Cpu className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <BookOpenCheck className="h-10 w-10 text-indigo-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">HireWrite</h1>
            <p className="text-sm text-gray-500">Powered by Lyzr's multiple LLM integration</p>
          </div>
        </div>
        <button
          onClick={onNavigateToMainApp}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          Skip to App <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <h2 className="text-2xl font-bold mb-2">Welcome to the Lyzr Multi-LLM Experience</h2>
            <p className="text-indigo-100">
              HireWrite demonstrates the power of integrating multiple AI models through a single API.
              Choose the model that best fits your needs.
            </p>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'performance'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('performance')}
              >
                Performance
              </button>
              <button
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'learn'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('learn')}
              >
                Learn More
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Choose an AI Model to Get Started</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {llmModels.map((model) => (
                    <div
                      key={model.id}
                      className={`border rounded-lg p-6 cursor-pointer transition-all ${
                        selectedModel === model.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleModelSelect(model.id)}
                    >
                      <div className="flex items-center mb-4">
                        {getModelIcon(model.id)}
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900">{model.name}</h4>
                          <p className="text-sm text-gray-500">{model.provider}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                      <p className="text-sm font-medium text-indigo-600">{model.strengths}</p>
                      
                      <div className="mt-4">
                        <button
                          className={`w-full py-2 rounded-md ${
                            selectedModel === model.id
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          onClick={() => handleModelSelect(model.id)}
                        >
                          {selectedModel === model.id ? 'Selected' : 'Select Model'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    <BarChart className="h-5 w-5 inline mr-2 text-indigo-500" />
                    Usage Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Total Generations</h4>
                      <p className="text-2xl font-bold text-indigo-600">{usageStats.totalGenerations}</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Model Distribution</h4>
                      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${usageStats.modelDistribution.claude}%` }}></div>
                        <div className="h-full bg-green-500" style={{ width: `${usageStats.modelDistribution.gpt4o}%`, marginTop: '-16px' }}></div>
                        <div className="h-full bg-orange-500" style={{ width: `${usageStats.modelDistribution.llama}%`, marginTop: '-16px' }}></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <span>Claude: {usageStats.modelDistribution.claude.toFixed(0)}%</span>
                        <span>GPT-4o: {usageStats.modelDistribution.gpt4o.toFixed(0)}%</span>
                        <span>LLaMA: {usageStats.modelDistribution.llama.toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Average Response Time</h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-sm font-medium">Claude</p>
                          <p className="text-lg font-bold text-purple-600">
                            {usageStats.responseTime.claude ? (usageStats.responseTime.claude / 1000).toFixed(1) + 's' : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">GPT-4o</p>
                          <p className="text-lg font-bold text-green-600">
                            {usageStats.responseTime.gpt4o ? (usageStats.responseTime.gpt4o / 1000).toFixed(1) + 's' : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">LLaMA</p>
                          <p className="text-lg font-bold text-orange-600">
                            {usageStats.responseTime.llama ? (usageStats.responseTime.llama / 1000).toFixed(1) + 's' : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Model Performance Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-base font-medium text-gray-800 mb-3">Comparative Performance</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Speed</span>
                          <div className="flex space-x-2">
                            <span className="text-xs text-purple-600">Claude</span>
                            <span className="text-xs text-green-600">GPT-4o</span>
                            <span className="text-xs text-orange-600">LLaMA</span>
                          </div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${performanceData.claude.speed}%` }}></div>
                          <div className="h-full bg-green-500" style={{ width: `${performanceData.gpt4o.speed}%`, marginTop: '-16px' }}></div>
                          <div className="h-full bg-orange-500" style={{ width: `${performanceData.llama.speed}%`, marginTop: '-16px' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Accuracy</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${performanceData.claude.accuracy}%` }}></div>
                          <div className="h-full bg-green-500" style={{ width: `${performanceData.gpt4o.accuracy}%`, marginTop: '-16px' }}></div>
                          <div className="h-full bg-orange-500" style={{ width: `${performanceData.llama.accuracy}%`, marginTop: '-16px' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Creativity</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${performanceData.claude.creativity}%` }}></div>
                          <div className="h-full bg-green-500" style={{ width: `${performanceData.gpt4o.creativity}%`, marginTop: '-16px' }}></div>
                          <div className="h-full bg-orange-500" style={{ width: `${performanceData.llama.creativity}%`, marginTop: '-16px' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">Structure</span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500" style={{ width: `${performanceData.claude.structure}%` }}></div>
                          <div className="h-full bg-green-500" style={{ width: `${performanceData.gpt4o.structure}%`, marginTop: '-16px' }}></div>
                          <div className="h-full bg-orange-500" style={{ width: `${performanceData.llama.structure}%`, marginTop: '-16px' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-base font-medium text-gray-800 mb-3">Best Use Cases</h4>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="border-l-4 border-purple-500 pl-3 py-1">
                        <h5 className="font-medium text-purple-700">Claude 3.5 Sonnet</h5>
                        <ul className="text-sm text-gray-600 ml-4 list-disc">
                          {performanceData.claude.bestFor.map((use, index) => (
                            <li key={index}>{use}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="border-l-4 border-green-500 pl-3 py-1">
                        <h5 className="font-medium text-green-700">GPT-4o</h5>
                        <ul className="text-sm text-gray-600 ml-4 list-disc">
                          {performanceData.gpt4o.bestFor.map((use, index) => (
                            <li key={index}>{use}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="border-l-4 border-orange-500 pl-3 py-1">
                        <h5 className="font-medium text-orange-700">LLaMA 3.3 70B</h5>
                        <ul className="text-sm text-gray-600 ml-4 list-disc">
                          {performanceData.llama.bestFor.map((use, index) => (
                            <li key={index}>{use}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'learn' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">About Lyzr's Multi-LLM Platform</h3>
                
                <div className="bg-indigo-50 p-6 rounded-lg mb-6">
                  <h4 className="text-base font-medium text-indigo-800 mb-2">
                    <Zap className="h-5 w-5 inline mr-1" />
                    The Power of Multiple AI Models
                  </h4>
                  <p className="text-gray-700 mb-4">
                    Lyzr's platform provides a unified interface to access multiple large language models
                    through a single, consistent API. This allows developers to leverage the unique strengths
                    of each model without having to manage multiple integrations.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h5 className="font-medium text-gray-800 mb-1">Unified API</h5>
                      <p className="text-sm text-gray-600">
                        Integrate once, access multiple AI models through the same standardized interface.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h5 className="font-medium text-gray-800 mb-1">Model Switching</h5>
                      <p className="text-sm text-gray-600">
                        Switch between models with a single parameter change, no code refactoring needed.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-md shadow-sm">
                      <h5 className="font-medium text-gray-800 mb-1">Cost Optimization</h5>
                      <p className="text-sm text-gray-600">
                        Choose the most cost-effective model for each task to optimize your AI budget.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="text-base font-medium text-gray-800 mb-4">
                    <TrendingUp className="h-5 w-5 inline mr-1" />
                    Benefits of a Multi-LLM Approach
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-800 font-medium">1</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h5 className="text-gray-800 font-medium">Adaptability</h5>
                        <p className="text-sm text-gray-600">
                          Different content types benefit from different AI strengths. Use Claude for structured, 
                          professional content, GPT-4o for creative and nuanced writing, and LLaMA for quick iterations.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-800 font-medium">2</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h5 className="text-gray-800 font-medium">Resilience</h5>
                        <p className="text-sm text-gray-600">
                          If one model is unavailable or performing poorly, your application can seamlessly
                          switch to an alternative, ensuring continuous service for your users.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-800 font-medium">3</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <h5 className="text-gray-800 font-medium">Future-Proof</h5>
                        <p className="text-sm text-gray-600">
                          As new models emerge, Lyzr makes it easy to integrate them into your existing
                          application without major refactoring, keeping you at the forefront of AI capabilities.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;