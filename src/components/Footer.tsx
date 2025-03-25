import React, { useState } from 'react';
import { 
  FileDown, 
  Link, 
  ClipboardCopy, 
  Share, 
  FileText,
  Download,
  Check,
  Wrench,
  Loader,
  Zap,
  BarChart2
} from 'lucide-react';
import { JobDescription, sectionLabels, LLMModelType } from '../types';
import { useDevTools } from '../context/DevToolsContext';
import { 
  generateFormattedJobDescription, 
  exportToPDF, 
  exportToDOCX 
} from '../services/exportService';
import ModelComparisonModal from './ModelComparisonModal';

interface FooterProps {
  jobDescription: JobDescription;
  selectedModel: LLMModelType;
}

const Footer: React.FC<FooterProps> = ({ jobDescription, selectedModel }) => {
  const [copied, setCopied] = useState(false);
  const [exportLoading, setExportLoading] = useState<'pdf' | 'docx' | null>(null);
  const { isEnabled, toggleDevTools } = useDevTools();
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  
  const copyToClipboard = () => {
    const formattedJD = generateFormattedJobDescription(jobDescription);
    navigator.clipboard.writeText(formattedJD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleExportPDF = async () => {
    if (!isJobDescriptionComplete()) return;
    
    try {
      setExportLoading('pdf');
      await exportToPDF(jobDescription);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setExportLoading(null);
    }
  };
  
  const handleExportDOCX = async () => {
    if (!isJobDescriptionComplete()) return;
    
    try {
      setExportLoading('docx');
      await exportToDOCX(jobDescription);
    } catch (error) {
      console.error('Error exporting to DOCX:', error);
      alert('Failed to export DOCX. Please try again.');
    } finally {
      setExportLoading(null);
    }
  };
  
  const createShareableLink = () => {
    // This is a placeholder for generating a shareable link
    alert('Creating a shareable link would happen here in a real implementation.');
  };
  
  const isJobDescriptionComplete = () => {
    if (!jobDescription.title) return false;
    
    // Check if at least the summary and responsibilities sections are filled out
    const requiredSections = ['summary', 'responsibilities', 'requiredQualifications'];
    return requiredSections.every(section => 
      !!jobDescription.sections[section as keyof typeof jobDescription.sections].content
    );
  };

  const openComparisonModal = () => {
    if (!jobDescription.title) {
      alert('Please enter a job title before comparing models.');
      return;
    }
    setIsComparisonModalOpen(true);
  };
  
  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-4">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <p className="text-sm text-gray-600">
              {isJobDescriptionComplete() 
                ? 'Your job description is ready to export!' 
                : 'Complete the required sections to export your job description.'}
            </p>
          </div>
          
          <div className="flex gap-2">
            {/* Developer Tools Button moved here, to the left of copy button */}
            {isEnabled ? (
              <button 
                onClick={toggleDevTools}
                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-indigo-600 hover:bg-gray-50"
                title="Toggle Developer Tools"
              >
                <Wrench className="h-4 w-4 mr-1" />
                <span>Dev Tools</span>
              </button>
            ) : (
              <button 
                onClick={toggleDevTools}
                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-400 hover:bg-gray-50 opacity-70 hover:opacity-100"
                title="Developer Tools"
              >
                <Wrench className="h-4 w-4 mr-1" />
                <span>Dev</span>
              </button>
            )}
            
            {/* Compare Models Button */}
            <button
              onClick={openComparisonModal}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-purple-600 hover:bg-gray-50"
              title="Compare AI Models"
            >
              <BarChart2 className="h-4 w-4 mr-1" />
              <span>Compare Models</span>
            </button>
            
            <button
              onClick={copyToClipboard}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              disabled={!isJobDescriptionComplete()}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardCopy className="h-4 w-4 mr-1" />
                  Copy
                </>
              )}
            </button>
            
            <button 
              onClick={handleExportPDF}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              disabled={!isJobDescriptionComplete() || exportLoading !== null}
            >
              {exportLoading === 'pdf' ? (
                <>
                  <Loader className="h-4 w-4 mr-1 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-1" />
                  PDF
                </>
              )}
            </button>
            
            <button 
              onClick={handleExportDOCX}
              className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              disabled={!isJobDescriptionComplete() || exportLoading !== null}
            >
              {exportLoading === 'docx' ? (
                <>
                  <Loader className="h-4 w-4 mr-1 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" />
                  DOCX
                </>
              )}
            </button>
            
            <button 
              onClick={createShareableLink}
              className="flex items-center px-3 py-2 bg-indigo-600 rounded-md text-sm text-white hover:bg-indigo-700"
              disabled={!isJobDescriptionComplete()}
            >
              <Share className="h-4 w-4 mr-1" />
              Share
            </button>
          </div>
        </div>
      </div>
      
      {/* Model Comparison Modal */}
      <ModelComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        jobTitle={jobDescription.title}
        seniority={jobDescription.seniority}
        employmentType={jobDescription.employmentType}
        remoteOption={jobDescription.remoteOption}
        section="summary"
        tone={jobDescription.tone}
        teamSize={jobDescription.teamSize}
        reportingTo={jobDescription.reportingTo}
        tools={jobDescription.tools}
      />
    </footer>
  );
};

export default Footer;