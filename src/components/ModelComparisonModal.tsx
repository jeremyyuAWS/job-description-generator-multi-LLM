import React, { useState, useEffect } from 'react';
import { X, Loader2, BarChart, ThumbsUp, ThumbsDown } from 'lucide-react';
import { LLMModelType, llmModels, SectionType, sectionLabels } from '../types';
import { generateContent } from '../services/aiService';

interface ModelComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  seniority: string;
  employmentType: string;
  remoteOption: string;
  section: SectionType;
  tone: string;
  teamSize: string;
  reportingTo: string;
  tools: string;
}

interface ModelResult {
  content: string;
  loading: boolean;
  error: string | null;
  generationTime: number | null;
}

const ModelComparisonModal: React.FC<ModelComparisonModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  seniority,
  employmentType,
  remoteOption,
  section,
  tone,
  teamSize,
  reportingTo,
  tools
}) => {
  const [results, setResults] = useState<Record<LLMModelType, ModelResult>>({
    claude: { content: '', loading: true, error: null, generationTime: null },
    gpt4o: { content: '', loading: true, error: null, generationTime: null },
    llama: { content: '', loading: true, error: null, generationTime: null }
  });

  const [votes, setVotes] = useState<Record<LLMModelType, number>>({
    claude: 0,
    gpt4o: 0,
    llama: 0
  });

  useEffect(() => {
    if (isOpen && jobTitle) {
      generateForAllModels();
    }
  }, [isOpen, jobTitle]);

  const generateForAllModels = async () => {
    // Reset results
    setResults({
      claude: { content: '', loading: true, error: null, generationTime: null },
      gpt4o: { content: '', loading: true, error: null, generationTime: null },
      llama: { content: '', loading: true, error: null, generationTime: null }
    });

    // Reset votes
    setVotes({
      claude: 0,
      gpt4o: 0,
      llama: 0
    });

    // Generate content for each model
    llmModels.forEach(model => {
      generateForModel(model.id);
    });
  };

  const generateForModel = async (modelId: LLMModelType) => {
    const startTime = Date.now();
    
    try {
      const content = await generateContent({
        jobTitle,
        seniority,
        employmentType,
        remoteOption,
        section,
        tone,
        teamSize,
        reportingTo,
        tools,
        model: modelId
      });
      
      const generationTime = Date.now() - startTime;
      
      setResults(prev => ({
        ...prev,
        [modelId]: {
          content,
          loading: false,
          error: null,
          generationTime
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [modelId]: {
          content: '',
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
          generationTime: Date.now() - startTime
        }
      }));
    }
  };

  const handleVote = (modelId: LLMModelType) => {
    setVotes(prev => ({
      ...prev,
      [modelId]: prev[modelId] + 1
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Model Comparison</h2>
            <p className="text-sm text-gray-500">
              Compare how different AI models generate the {sectionLabels[section]} section
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {llmModels.map(model => (
              <div key={model.id} className="border rounded-lg p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-lg">{model.name}</h3>
                    <p className="text-xs text-gray-500">{model.provider}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleVote(model.id)}
                      className="p-1 text-gray-400 hover:text-green-600"
                      title="Vote for this model"
                    >
                      <ThumbsUp className="h-5 w-5" />
                    </button>
                    {votes[model.id] > 0 && (
                      <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        {votes[model.id]}
                      </span>
                    )}
                  </div>
                </div>
                
                {results[model.id].loading ? (
                  <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Generating content...</p>
                    </div>
                  </div>
                ) : results[model.id].error ? (
                  <div className="flex-grow bg-red-50 p-4 rounded-md text-red-800 text-sm">
                    <p>Error: {results[model.id].error}</p>
                  </div>
                ) : (
                  <div className="flex-grow">
                    <div className="bg-gray-50 p-3 rounded-md mb-2 h-[300px] overflow-y-auto text-sm">
                      <pre className="whitespace-pre-wrap font-sans">{results[model.id].content}</pre>
                    </div>
                    
                    {results[model.id].generationTime && (
                      <div className="flex items-center text-xs text-gray-500">
                        <BarChart className="h-3 w-3 mr-1" />
                        <span>Generated in {(results[model.id].generationTime / 1000).toFixed(2)}s</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={generateForAllModels}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
            disabled={Object.values(results).some(r => r.loading)}
          >
            Regenerate All
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelComparisonModal;