import React from 'react';
import { LLMModelType, llmModels } from '../types';
import { Brain, Sparkles, Zap, Star, TrendingUp, CheckCircle } from 'lucide-react';

interface AIModelInfoCardProps {
  modelId: LLMModelType;
  isSelected: boolean;
  onSelect: (model: LLMModelType) => void;
  showExtendedInfo?: boolean;
}

const AIModelInfoCard: React.FC<AIModelInfoCardProps> = ({
  modelId,
  isSelected,
  onSelect,
  showExtendedInfo = false
}) => {
  const model = llmModels.find(m => m.id === modelId) || llmModels[0];

  const getModelIcon = () => {
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

  const getModelColor = () => {
    switch (modelId) {
      case 'claude':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'gpt4o':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'llama':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Model-specific features
  const modelFeatures = {
    claude: [
      'Professional tone & structure',
      'Excellent for formal writing',
      'Reliable & consistent output'
    ],
    gpt4o: [
      'Creative & nuanced writing',
      'Adept at complex topics',
      'Advanced reasoning capabilities'
    ],
    llama: [
      'Extremely fast response times',
      'Efficient for simple tasks',
      'Cost-effective at scale'
    ]
  };

  // Model-specific use cases
  const modelUseCases = {
    claude: [
      'Official company documentation',
      'Legal-adjacent content',
      'Professional communications'
    ],
    gpt4o: [
      'Creative marketing copy',
      'Detailed technical explanations',
      'Complex problem-solving'
    ],
    llama: [
      'High-volume content generation',
      'Quick drafts and iterations',
      'Real-time applications'
    ]
  };

  return (
    <div 
      className={`border rounded-lg overflow-hidden transition-all ${
        isSelected 
          ? 'border-indigo-500 shadow-md' 
          : 'border-gray-200 hover:border-indigo-300'
      }`}
    >
      <div className={`p-4 ${isSelected ? 'bg-indigo-50' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {getModelIcon()}
            <div className="ml-2">
              <h3 className="font-medium text-gray-900">{model.name}</h3>
              <p className="text-xs text-gray-500">{model.provider}</p>
            </div>
          </div>
          
          {isSelected ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Selected
            </span>
          ) : (
            <button
              onClick={() => onSelect(modelId)}
              className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
            >
              Select
            </button>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-2">{model.description}</p>
        <p className="text-sm font-medium text-indigo-600 mb-3">
          <Star className="h-3 w-3 inline-block mr-1" />
          {model.strengths}
        </p>
        
        {showExtendedInfo && (
          <>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                Key Features
              </h4>
              <ul className="text-xs text-gray-600 space-y-1 ml-4">
                {modelFeatures[modelId].map((feature, index) => (
                  <li key={index} className="list-disc">{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Best Use Cases</h4>
              <ul className="text-xs text-gray-600 space-y-1 ml-4">
                {modelUseCases[modelId].map((useCase, index) => (
                  <li key={index} className="list-disc">{useCase}</li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className={`text-xs px-2 py-1 rounded ${getModelColor()}`}>
                {modelId === 'claude' && 'Excels at structured, professional content'}
                {modelId === 'gpt4o' && 'Best for creative and nuanced writing'}
                {modelId === 'llama' && 'Optimized for speed and efficiency'}
              </div>
            </div>
          </>
        )}
      </div>
      
      {!isSelected && (
        <div 
          className="p-2 bg-gray-50 text-center border-t border-gray-200 hover:bg-indigo-50 cursor-pointer"
          onClick={() => onSelect(modelId)}
        >
          <span className="text-xs font-medium text-indigo-600">Use This Model</span>
        </div>
      )}
    </div>
  );
};

export default AIModelInfoCard;