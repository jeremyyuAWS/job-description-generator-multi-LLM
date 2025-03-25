import { JobDescription } from '../types';

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  jobDescription: JobDescription;
}

export type TemplateCategory = 
  | 'Technology'
  | 'Marketing'
  | 'Sales'
  | 'Finance'
  | 'Human Resources'
  | 'Operations'
  | 'Customer Service'
  | 'Healthcare'
  | 'Education';

// Template data
export const templates: Template[] = [
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    category: 'Technology',
    description: 'A standard template for software engineering roles focused on development skills.',
    jobDescription: {
      title: 'Software Engineer',
      seniority: 'Mid-Level',
      employmentType: 'Full-Time',
      remoteOption: 'Hybrid',
      teamSize: '5-10 people',
      reportingTo: 'Engineering Manager',
      tools: 'JavaScript, React, Node.js, Git, AWS',
      sections: {
        summary: {
          content: 'We are seeking a talented Software Engineer to join our development team. In this role, you will design, develop, and implement software solutions that meet our business requirements. You will collaborate with cross-functional teams to deliver high-quality code that is scalable, maintainable, and efficient.',
          suggestions: []
        },
        responsibilities: {
          content: '• Design, develop, and maintain software applications using JavaScript, React, and Node.js\n• Collaborate with product managers, designers, and other engineers to deliver features\n• Write clean, testable code with appropriate documentation\n• Participate in code reviews to ensure code quality and share knowledge\n• Troubleshoot and debug applications to optimize performance\n• Implement automated testing to ensure application reliability\n• Stay current with emerging trends and technologies',
          suggestions: []
        },
        requiredQualifications: {
          content: '• Bachelor\'s degree in Computer Science or equivalent practical experience\n• 2-4 years of experience in software development\n• Proficiency in JavaScript, including modern ES6+ features\n• Experience with React.js and building responsive web applications\n• Knowledge of Node.js backend development\n• Familiarity with version control systems (Git)\n• Strong problem-solving skills and attention to detail\n• Good communication and collaboration abilities',
          suggestions: []
        },
        preferredQualifications: {
          content: '• Experience with TypeScript and static typing\n• Knowledge of cloud services (AWS, Google Cloud, or Azure)\n• Familiarity with CI/CD pipelines and DevOps practices\n• Understanding of database technologies (SQL and NoSQL)\n• Experience with agile development methodologies\n• Prior work with microservice architectures\n• Open source contributions',
          suggestions: []
        },
        benefits: {
          content: '• Competitive salary and performance bonuses\n• Comprehensive health, dental, and vision insurance\n• 401(k) matching program\n• Flexible work arrangements and remote options\n• Professional development budget\n• Regular team-building events\n• Casual work environment with modern office amenities\n• Paid time off and company holidays',
          suggestions: []
        },
        companyBlurb: {
          content: 'Our company builds innovative software solutions that help businesses streamline their operations and improve customer experiences. We foster a collaborative culture where creativity, continuous learning, and work-life balance are valued. Join our team to work on challenging projects in a supportive environment where your ideas matter.',
          suggestions: []
        }
      },
      tone: 'Professional'
    }
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    category: 'Technology',
    description: 'A comprehensive template for product management positions focused on strategy and execution.',
    jobDescription: {
      title: 'Product Manager',
      seniority: 'Mid-Level',
      employmentType: 'Full-Time',
      remoteOption: 'Hybrid',
      teamSize: '3-5 people',
      reportingTo: 'Director of Product',
      tools: 'Jira, Figma, Google Analytics, Amplitude, SQL',
      sections: {
        summary: {
          content: 'We are looking for a skilled Product Manager to drive the strategy and execution of our digital products. In this role, you will work at the intersection of user needs, business goals, and technology to define product vision and roadmap. You will lead cross-functional teams to deliver exceptional products that solve real customer problems.',
          suggestions: []
        },
        responsibilities: {
          content: '• Own the product roadmap and strategy for assigned products or features\n• Conduct user research and competitive analysis to identify market opportunities\n• Define product requirements and create detailed specifications\n• Work closely with engineering, design, and marketing teams to deliver successful products\n• Prioritize features and enhancements based on business value and user impact\n• Track and analyze key metrics to measure product performance\n• Communicate product plans, benefits, and results to various stakeholders\n• Manage the entire product lifecycle from conception to launch and post-release refinement',
          suggestions: []
        },
        requiredQualifications: {
          content: '• Bachelor\'s degree in Business, Computer Science, or related field\n• 3+ years of experience in product management\n• Strong analytical and problem-solving skills\n• Excellent communication and presentation abilities\n• Experience with agile development methodologies\n• Ability to translate business requirements into product specifications\n• Data-driven decision-making approach\n• Basic understanding of UX design principles',
          suggestions: []
        },
        preferredQualifications: {
          content: '• MBA or other advanced degree\n• Experience with analytics tools (Google Analytics, Amplitude, Mixpanel)\n• Knowledge of SQL for data analysis\n• Background in the same industry as our product\n• Technical background or experience working closely with development teams\n• Previous experience launching successful products\n• Certification in product management or agile methodologies',
          suggestions: []
        },
        benefits: {
          content: '• Competitive salary and bonus structure based on product performance\n• Comprehensive health benefits package\n• Stock options and equity grants\n• Flexible work arrangements\n• Professional development opportunities\n• Paid parental leave\n• Education reimbursement program\n• Regular team events and activities',
          suggestions: []
        },
        companyBlurb: {
          content: 'Our company creates innovative digital solutions that transform how businesses engage with their customers. We believe in a collaborative approach to product development where every team member\'s input is valued. Our culture emphasizes continuous learning, data-driven decision making, and maintaining a healthy work-life balance. Join us to build products that make a difference in people\'s lives.',
          suggestions: []
        }
      },
      tone: 'Professional'
    }
  },
  {
    id: 'marketing-manager',
    name: 'Marketing Manager',
    category: 'Marketing',
    description: 'A template for marketing management roles with a focus on digital campaigns and analytics.',
    jobDescription: {
      title: 'Marketing Manager',
      seniority: 'Mid-Level',
      employmentType: 'Full-Time',
      remoteOption: 'Hybrid',
      teamSize: '3-5 people',
      reportingTo: 'Director of Marketing',
      tools: 'Google Analytics, HubSpot, Mailchimp, Adobe Creative Suite, Social Media Platforms',
      sections: {
        summary: {
          content: 'We are seeking a creative and data-driven Marketing Manager to develop and execute marketing strategies that drive brand awareness, customer acquisition, and business growth. The ideal candidate will have experience managing multi-channel campaigns and a strong understanding of digital marketing techniques.',
          suggestions: []
        },
        responsibilities: {
          content: '• Develop comprehensive marketing strategies aligned with business objectives\n• Plan and execute digital marketing campaigns across multiple channels\n• Manage the marketing budget and optimize spending for maximum ROI\n• Create and curate engaging content for various platforms\n• Analyze campaign performance and customer data to inform marketing decisions\n• Collaborate with the design team to create compelling marketing materials\n• Maintain brand consistency across all marketing initiatives\n• Stay current on marketing trends and best practices',
          suggestions: []
        },
        requiredQualifications: {
          content: '• Bachelor\'s degree in Marketing, Business, or related field\n• 3+ years of experience in marketing, with a focus on digital channels\n• Experience managing social media campaigns and content calendars\n• Proficiency with marketing analytics tools and data analysis\n• Strong project management and organizational skills\n• Excellent written and verbal communication abilities\n• Experience with email marketing platforms and CRM systems',
          suggestions: []
        },
        preferredQualifications: {
          content: '• MBA or advanced degree in Marketing\n• Experience with paid advertising platforms (Google Ads, Facebook Ads)\n• Knowledge of SEO/SEM and content marketing strategies\n• Experience with marketing automation tools\n• Understanding of customer journey mapping and funnel optimization\n• Background in our industry or market\n• Graphic design skills and experience with Adobe Creative Suite',
          suggestions: []
        },
        benefits: {
          content: '• Competitive salary and performance-based bonuses\n• Comprehensive health, dental, and vision insurance\n• 401(k) matching program\n• Flexible work arrangements\n• Professional development budget\n• Marketing conference and event attendance\n• Latest technology and tools for marketing success\n• Collaborative and creative work environment',
          suggestions: []
        },
        companyBlurb: {
          content: 'Our company provides innovative solutions that help businesses thrive in today\'s competitive marketplace. We value creativity, data-driven decision making, and a collaborative approach to marketing. Our team is passionate about creating meaningful connections with customers and driving measurable results. Join us to grow your marketing career in an environment that fosters professional development and creative expression.',
          suggestions: []
        }
      },
      tone: 'Professional'
    }
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    category: 'Technology',
    description: 'A template for data analysis roles with emphasis on analytical skills and business intelligence.',
    jobDescription: {
      title: 'Data Analyst',
      seniority: 'Mid-Level',
      employmentType: 'Full-Time',
      remoteOption: 'Remote',
      teamSize: '3-5 people',
      reportingTo: 'Data Science Manager',
      tools: 'SQL, Excel, Tableau, Python, R, Power BI',
      sections: {
        summary: {
          content: 'We are looking for a detail-oriented Data Analyst to help transform our data into insights that drive business decisions. The ideal candidate will have strong analytical skills, expertise in data modeling, and the ability to communicate complex findings in a clear, actionable way to stakeholders across the organization.',
          suggestions: []
        },
        responsibilities: {
          content: '• Collect, process, and analyze data from multiple sources\n• Create and maintain dashboards and reports to track key metrics\n• Identify trends, patterns, and opportunities in complex datasets\n• Collaborate with cross-functional teams to understand data needs\n• Develop and implement data quality processes\n• Create visualizations that effectively communicate insights\n• Support business decision-making with data-driven recommendations\n• Document data processes and methodologies',
          suggestions: []
        },
        requiredQualifications: {
          content: '• Bachelor\'s degree in Statistics, Mathematics, Computer Science, or related field\n• 2+ years of experience in data analysis or business intelligence\n• Proficiency in SQL and experience with relational databases\n• Strong skills in data visualization tools (Tableau, Power BI)\n• Experience with Excel for advanced data analysis\n• Ability to transform raw data into meaningful insights\n• Strong problem-solving and critical thinking skills\n• Excellent communication skills for presenting data to non-technical audiences',
          suggestions: []
        },
        preferredQualifications: {
          content: '• Master\'s degree in a quantitative field\n• Experience with programming languages like Python or R\n• Knowledge of statistical analysis and methods\n• Experience with data warehousing and ETL processes\n• Background in our industry or with similar data types\n• Familiarity with machine learning concepts\n• Experience with big data technologies (Hadoop, Spark)\n• Project management experience',
          suggestions: []
        },
        benefits: {
          content: '• Competitive salary based on experience\n• Comprehensive health, dental, and vision benefits\n• 401(k) retirement plan with company match\n• Flexible remote work policy\n• Professional development opportunities\n• Tuition reimbursement for relevant coursework\n• Modern tools and technology\n• Collaborative team environment',
          suggestions: []
        },
        companyBlurb: {
          content: 'Our company leverages data to drive innovation and solve complex business challenges. We believe in making decisions based on evidence and insights rather than hunches. Our analytics team plays a crucial role in helping the organization understand customer behavior, optimize operations, and identify new opportunities. Join us to work with diverse datasets in a collaborative environment where your analytical skills will have a real impact.',
          suggestions: []
        }
      },
      tone: 'Professional'
    }
  },
  {
    id: 'hr-manager',
    name: 'HR Manager',
    category: 'Human Resources',
    description: 'A template for HR management positions focused on employee experience and company culture.',
    jobDescription: {
      title: 'HR Manager',
      seniority: 'Mid-Level',
      employmentType: 'Full-Time',
      remoteOption: 'Hybrid',
      teamSize: '2-4 people',
      reportingTo: 'Director of Human Resources',
      tools: 'HRIS Systems, ATS, Microsoft Office, Performance Management Software',
      sections: {
        summary: {
          content: 'We are seeking an experienced HR Manager to oversee our human resources functions and foster a positive workplace culture. The ideal candidate will have strong interpersonal skills, knowledge of HR best practices, and the ability to implement programs that attract, develop, and retain top talent while ensuring compliance with employment laws and regulations.',
          suggestions: []
        },
        responsibilities: {
          content: '• Manage full-cycle recruitment for various departments\n• Develop and implement HR policies and procedures\n• Oversee employee relations, performance management, and engagement initiatives\n• Administer benefits programs and address employee inquiries\n• Ensure compliance with labor laws and regulations\n• Conduct onboarding and offboarding processes\n• Coordinate training and development programs\n• Partner with leadership on organizational development initiatives',
          suggestions: []
        },
        requiredQualifications: {
          content: '• Bachelor\'s degree in Human Resources, Business Administration, or related field\n• 3+ years of experience in human resources management\n• Knowledge of federal and state employment laws and regulations\n• Experience with HRIS and ATS systems\n• Strong interpersonal and conflict resolution skills\n• Excellent communication and presentation abilities\n• Demonstrated ability to maintain confidentiality\n• Experience developing HR policies and procedures',
          suggestions: []
        },
        preferredQualifications: {
          content: '• Master\'s degree in HR or related field\n• PHR, SPHR, or SHRM certification\n• Experience in our industry or similar organizational structure\n• Background in talent development and succession planning\n• Knowledge of compensation and benefits administration\n• Experience with change management and organizational development\n• Multi-state or international HR experience\n• Demonstrated leadership in diversity and inclusion initiatives',
          suggestions: []
        },
        benefits: {
          content: '• Competitive salary and bonus structure\n• Comprehensive health, dental, and vision insurance\n• 401(k) with employer matching\n• Professional development opportunities and certification support\n• Flexible work arrangements\n• Generous paid time off policy\n• Employee wellness program\n• Team building events and activities',
          suggestions: []
        },
        companyBlurb: {
          content: 'Our company believes that our success depends on creating an exceptional employee experience. We foster a culture of respect, inclusion, and continuous growth where every team member can thrive. As an organization committed to innovation, we value fresh perspectives and collaborative problem-solving. Join our HR team to help build and maintain a workplace where talent is recognized, developed, and celebrated.',
          suggestions: []
        }
      },
      tone: 'Professional'
    }
  }
];

export const getTemplatesByCategory = (category: TemplateCategory): Template[] => {
  return templates.filter(template => template.category === category);
};

export const getAllTemplateCategories = (): TemplateCategory[] => {
  const categories = new Set<TemplateCategory>();
  templates.forEach(template => categories.add(template.category));
  return Array.from(categories);
};

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(template => template.id === id);
};