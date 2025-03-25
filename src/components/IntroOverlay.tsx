import React, { useState, useEffect } from 'react';
import { X, BookOpenCheck, Zap, Brain, Sparkles, BarChart } from 'lucide-react';

interface IntroOverlayProps {
  onClose: () => void;
}

const IntroOverlay: React.FC<IntroOverlayProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Check if this is the first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hirewrite_visited');
    if (hasVisited) {
      setIsVisible(false);
      onClose();
    }
  }, [onClose]);

  const handleClose = () => {
    localStorage.setItem('hirewrite_visited', 'true');
    setIsVisible(false);
    onClose();
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BookOpenCheck className="h-8 w-8 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-800">Welcome to HireWrite</h2>
            </div>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full flex-1 mx-1 ${
                    index + 1 <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500 text-right">
              Step {currentStep} of {totalSteps}
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-indigo-700">
                Multiple AI Models at Your Fingertips
              </h3>
              <p className="text-gray-700">
                HireWrite gives you access to three powerful AI models through a unified interface, 
                letting you craft the perfect job description with the right tone and style.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex items-center mb-2">
                    <Brain className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-medium text-purple-700">Claude 3.5 Sonnet</h4>
                  </div>
                  <p className="text-sm text-purple-800">
                    Excels at structured, professional content with clear organization and formal tone.
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-medium text-green-700">GPT-4o</h4>
                  </div>
                  <p className="text-sm text-green-800">
                    Creates engaging, creative content with nuanced language and compelling narratives.
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <div className="flex items-center mb-2">
                    <Zap className="h-5 w-5 text-orange-600 mr-2" />
                    <h4 className="font-medium text-orange-700">LLaMA 3.3 70B</h4>
                  </div>
                  <p className="text-sm text-orange-800">
                    Delivers direct, efficient content with fast response times and straightforward language.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-indigo-700">
                Powerful Role Summary Builder
              </h3>
              <p className="text-gray-700">
                Our specialized Role Summary Builder helps you create the perfect opening for your job description.
              </p>
              <div className="bg-indigo-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-indigo-700 mb-2">Key Features:</h4>
                <ul className="space-y-2 text-indigo-800">
                  <li className="flex items-start">
                    <BarChart className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Choose from different focus types: candidate-focused, company-focused, impact-focused and more</span>
                  </li>
                  <li className="flex items-start">
                    <Zap className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Compare output from all three AI models side-by-side</span>
                  </li>
                  <li className="flex items-start">
                    <Sparkles className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Add custom instructions to fine-tune your summary</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4">
                <img 
                  src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3" 
                  alt="HireWrite interface" 
                  className="rounded-lg border border-gray-200 shadow-sm"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-indigo-700">
                Ready to Get Started?
              </h3>
              <p className="text-gray-700">
                HireWrite makes it easy to create professional job descriptions that attract the right talent.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4 border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Quick Start Guide:</h4>
                <ol className="space-y-2 text-gray-700 list-decimal ml-5">
                  <li>Enter basic job details in the left panel</li>
                  <li>Use the Role Summary Builder for the perfect opening</li>
                  <li>Fill in remaining sections with AI assistance</li>
                  <li>Check inclusivity score and suggestions</li>
                  <li>Export your finished job description</li>
                </ol>
              </div>
              <p className="text-indigo-600 font-medium mt-4">
                Powered by Lyzr's multi-LLM platform for seamless AI model integration
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
            ) : (
              <div></div>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {currentStep < totalSteps ? 'Next' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroOverlay;