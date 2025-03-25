import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Cpu, Sparkles, Zap } from 'lucide-react';
import { LLMModel, LLMModelType, llmModels } from '../types';

interface ModelSelectorProps {
  selectedModel: LLMModelType;
  onSelectModel: (model: LLMModelType) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onSelectModel 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedModelData = llmModels.find(model => model.id === selectedModel) || llmModels[0];

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectModel = (modelId: LLMModelType) => {
    onSelectModel(modelId);
    setIsOpen(false);
  };

  // Get icon based on model type
  const getModelIcon = (modelId: LLMModelType) => {
    switch (modelId) {
      case 'claude':
        return <Cpu className="h-4 w-4" />;
      case 'gpt4o':
        return <Sparkles className="h-4 w-4" />;
      case 'llama':
        return <Zap className="h-4 w-4" />;
      default:
        return <Cpu className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        <span className="mr-1 text-indigo-600">{getModelIcon(selectedModel)}</span>
        <span className="mr-2">{selectedModelData.name}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1 border-b border-gray-200 px-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Select AI Model
            </p>
          </div>
          <div className="py-1">
            {llmModels.map((model) => (
              <button
                key={model.id}
                onClick={() => handleSelectModel(model.id)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  selectedModel === model.id ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2 text-indigo-600">{getModelIcon(model.id)}</span>
                    <div>
                      <div className="font-medium text-sm">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.provider}</div>
                    </div>
                  </div>
                  {selectedModel === model.id && (
                    <Check className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1 ml-6">{model.description}</p>
                <p className="text-xs text-indigo-600 mt-0.5 ml-6">{model.strengths}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;