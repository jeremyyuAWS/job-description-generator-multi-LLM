import React from 'react';
import { SectionType, JobDescription, sectionLabels } from '../types';
import { Briefcase, Bookmark, BarChart, Clock, MapPin, Users, UserCircle, PenTool as Tool, FileDown } from 'lucide-react';

interface LeftPanelProps {
  jobDescription: JobDescription;
  updateJobDescription: (data: Partial<JobDescription>) => void;
  activeSection: SectionType;
  setActiveSection: (section: SectionType) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ 
  jobDescription, 
  updateJobDescription,
  activeSection,
  setActiveSection 
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateJobDescription({ [name]: value });
  };

  const commonRoles = [
    'Software Engineer',
    'Product Manager',
    'Marketing Manager',
    'Data Analyst',
    'UX Designer',
    'Sales Representative',
    'Customer Success Manager',
    'Financial Analyst',
    'HR Manager',
    'Operations Manager'
  ];

  return (
    <div className="w-full md:w-1/4 bg-white border-r border-gray-200 overflow-y-auto p-4">
      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <Briefcase className="h-4 w-4 mr-1" /> Job Title
        </label>
        <input
          type="text"
          name="title"
          value={jobDescription.title}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g. Marketing Manager"
          list="common-roles"
        />
        <datalist id="common-roles">
          {commonRoles.map((role) => (
            <option key={role} value={role} />
          ))}
        </datalist>
      </div>

      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <BarChart className="h-4 w-4 mr-1" /> Seniority Level
        </label>
        <select
          name="seniority"
          value={jobDescription.seniority}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="Entry-Level">Entry-Level</option>
          <option value="Mid-Level">Mid-Level</option>
          <option value="Senior">Senior</option>
          <option value="Manager">Manager</option>
          <option value="Director">Director</option>
          <option value="Executive">Executive</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <Clock className="h-4 w-4 mr-1" /> Employment Type
        </label>
        <select
          name="employmentType"
          value={jobDescription.employmentType}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="Full-Time">Full-Time</option>
          <option value="Part-Time">Part-Time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <MapPin className="h-4 w-4 mr-1" /> Work Location
        </label>
        <select
          name="remoteOption"
          value={jobDescription.remoteOption}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
          <option value="On-Site">On-Site</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <Users className="h-4 w-4 mr-1" /> Team Size (Optional)
        </label>
        <input
          type="text"
          name="teamSize"
          value={jobDescription.teamSize}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g. 5-10 people"
        />
      </div>

      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <UserCircle className="h-4 w-4 mr-1" /> Reporting To (Optional)
        </label>
        <input
          type="text"
          name="reportingTo"
          value={jobDescription.reportingTo}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g. Marketing Director"
        />
      </div>

      <div className="mb-6">
        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <Tool className="h-4 w-4 mr-1" /> Tools & Technologies (Optional)
        </label>
        <input
          type="text"
          name="tools"
          value={jobDescription.tools}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g. Figma, Adobe Suite, etc."
        />
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Bookmark className="h-4 w-4 mr-1" /> Job Description Sections
        </h3>
        <div className="space-y-2">
          {Object.keys(jobDescription.sections).map((section) => (
            <button
              key={section}
              className={`w-full text-left p-2 rounded-md ${
                activeSection === section 
                  ? 'bg-indigo-100 text-indigo-700 font-medium border-l-4 border-indigo-500' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => setActiveSection(section as SectionType)}
            >
              {sectionLabels[section as SectionType]}
              {jobDescription.sections[section as SectionType].content ? 
                <span className="ml-2 text-xs text-green-600">✓</span> : 
                <span className="ml-2 text-xs text-gray-400">...</span>
              }
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;