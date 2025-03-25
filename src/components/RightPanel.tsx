import React, { useState, useEffect } from 'react';
import { JobDescription, sectionLabels } from '../types';
import { ImageOff } from 'lucide-react';

interface RightPanelProps {
  jobDescription: JobDescription;
}

const RightPanel: React.FC<RightPanelProps> = ({ jobDescription }) => {
  const { title, seniority, employmentType, remoteOption, sections } = jobDescription;
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Update image when title changes
  useEffect(() => {
    if (title) {
      setImageError(false);
      setImageUrl(getJobImageUrl(title));
    } else {
      setImageUrl(null);
    }
  }, [title]);
  
  // Get a job image URL based on the job title
  const getJobImageUrl = (jobTitle: string): string => {
    // Create a job category based on the title
    let category = 'office';
    const titleLower = jobTitle.toLowerCase();
    
    if (titleLower.includes('engineer') || titleLower.includes('developer') || titleLower.includes('programmer')) {
      category = 'programming';
    } else if (titleLower.includes('design')) {
      category = 'design';
    } else if (titleLower.includes('market')) {
      category = 'marketing';
    } else if (titleLower.includes('finance') || titleLower.includes('account')) {
      category = 'finance';
    } else if (titleLower.includes('hr') || titleLower.includes('human resources')) {
      category = 'office-people';
    } else if (titleLower.includes('data')) {
      category = 'data-analysis';
    } else if (titleLower.includes('product')) {
      category = 'product-management';
    } else if (titleLower.includes('sales')) {
      category = 'sales';
    } else if (titleLower.includes('customer')) {
      category = 'customer-service';
    }
    
    // Use specific high-quality image URLs that we know exist
    const imageUrls: Record<string, string> = {
      'programming': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
      'design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop',
      'marketing': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
      'finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop',
      'office-people': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=400&fit=crop',
      'data-analysis': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
      'product-management': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
      'sales': 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800&h=400&fit=crop',
      'customer-service': 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
      'office': 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=400&fit=crop'
    };
    
    return imageUrls[category] || imageUrls['office'];
  };
  
  const handleImageError = () => {
    console.log('Image failed to load');
    setImageError(true);
  };
  
  return (
    <div className="w-full md:w-5/12 bg-gray-50 overflow-y-auto">
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
          <h2 className="text-center text-xl font-semibold text-gray-800 mb-1">
            Live Preview
          </h2>
          <p className="text-center text-gray-500 text-sm mb-4">
            How your job description will appear to applicants
          </p>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {title && imageUrl && !imageError ? (
              <div className="relative w-full h-40 bg-gray-100">
                <img 
                  src={imageUrl}
                  alt={`${title} job header`}
                  className="w-full h-40 object-cover"
                  onError={handleImageError}
                />
              </div>
            ) : title && imageError ? (
              <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <ImageOff className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Image unavailable</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-40 bg-gray-100 animate-pulse"></div>
            )}
            
            <div className="p-6">
              {title ? (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {seniority} {title}
                  </h1>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {employmentType}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {remoteOption}
                    </span>
                  </div>
                </>
              ) : (
                <div className="h-14 bg-gray-100 rounded animate-pulse mb-4"></div>
              )}
              
              {Object.entries(sections).map(([sectionKey, sectionData]) => {
                const key = sectionKey as keyof typeof sections;
                return (
                  <div key={sectionKey} className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      {sectionLabels[key]}
                    </h2>
                    {sectionData.content ? (
                      <div className="text-gray-700 whitespace-pre-line">
                        {sectionData.content}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-100 rounded w-11/12 animate-pulse"></div>
                        <div className="h-4 bg-gray-100 rounded w-10/12 animate-pulse"></div>
                        {key === 'responsibilities' || key === 'requiredQualifications' ? (
                          <>
                            <div className="h-4 bg-gray-100 rounded w-9/12 animate-pulse"></div>
                            <div className="h-4 bg-gray-100 rounded w-10/12 animate-pulse"></div>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Customize the content in the left and center panels.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;