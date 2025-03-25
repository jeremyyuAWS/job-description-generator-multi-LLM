# HireWrite - AI Powered Job Description Generator

HireWrite is a modern web application that helps recruiters and hiring managers create professional job descriptions powered by multiple AI models. It streamlines the process of crafting compelling job postings by leveraging the strengths of different large language models.

![HireWrite Screenshot](https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3)

## Features

- **Multiple AI Models**: Choose between Claude 3.5 Sonnet, GPT-4o, and LLaMA 3.3 70B to leverage their unique strengths
- **Structured Job Descriptions**: Create complete job descriptions with all essential sections
- **AI-Powered Content Generation**: Generate, enhance, and rewrite job description content
- **Templates**: Start with pre-built templates for common roles
- **Inclusivity Checking**: Get feedback on potentially non-inclusive language
- **Export Options**: Export your job descriptions as PDF, DOCX, or copy to clipboard
- **Real-Time Feedback**: See live status updates during AI processing
- **Developer Tools**: Built-in tools for debugging and monitoring API calls

## Getting Started

### Prerequisites

- Node.js 16+ 
- Supabase account (for edge functions)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hirewrite.git
cd hirewrite
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Supabase configuration:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server:
```bash
npm run dev
```

## Deploying Supabase Edge Functions

HireWrite uses Supabase Edge Functions to communicate with AI services. Follow these steps to deploy the functions:

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your Supabase project:
```bash
supabase link --project-ref your-project-ref
```

4. Deploy the functions:
```bash
supabase functions deploy claude-sonnet-jd-generator
supabase functions deploy gpt--4o-jd-generator
supabase functions deploy grok-llama-jd-generator
```

## Configuration

### Environment Variables

HireWrite requires specific environment variables to connect to Supabase services. These are defined in the `.env.example` file at the project root:

```
VITE_SUPABASE_URL=https://gkzwjeanhjowwxzflcxb.supabase.co
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key_here>
```

For local development:
1. Copy `.env.example` to a new file named `.env`
2. Replace the placeholder values with your actual Supabase credentials

For production deployment on Netlify:
1. Go to your Netlify project dashboard
2. Navigate to Site settings > Environment variables
3. Add both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with their respective values
4. Trigger a new deployment for the changes to take effect

Note: The build process will automatically create a `.env.production` file during deployment if environment variables are properly configured in the Netlify dashboard.

### LLM API Keys

For the edge functions to work properly, you need to configure API keys for each model:

1. Claude: Use the Anthropic API key in the claude-sonnet-jd-generator function
2. GPT-4o: Use the OpenAI API key in the gpt--4o-jd-generator function
3. LLaMA 3.3: Use the Groq API key in the grok-llama-jd-generator function

## Usage Guide

### Creating a Job Description

1. **Fill in Job Details**: Enter job title, seniority level, and other basic information
2. **Choose an AI Model**: Select from Claude, GPT-4o, or LLaMA depending on your needs
3. **Generate Content**: The AI will generate suggestions for each section
4. **Customize Content**: Edit, enhance, or rewrite the AI-generated content
5. **Export Your Job Description**: Download as PDF/DOCX or copy to clipboard

### Model Selection

Each AI model has different strengths:

- **Claude 3.5 Sonnet**: Excellent for professional tone and well-structured content
- **GPT-4o**: Best for creative and nuanced content with polished output
- **LLaMA 3.3 70B**: Ideal for quick iterations with solid output

## LLM Model Integration

HireWrite integrates with AI models through Supabase Edge Functions. Each model has its own endpoint:

- Claude: `https://your-project.supabase.co/functions/v1/claude-sonnet-jd-generator`
- GPT-4o: `https://your-project.supabase.co/functions/v1/gpt--4o-jd-generator`
- LLaMA: `https://your-project.supabase.co/functions/v1/grok-llama-jd-generator`

To customize these integrations, modify the edge function files in the `supabase/functions` directory.

## Developer Tools

HireWrite includes built-in developer tools to help debug API calls and monitor performance:

1. Click the "Dev Tools" button in the footer
2. View detailed logs of all API calls
3. Analyze request/response data and performance metrics

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons provided by [Lucide React](https://lucide.dev)
- UI components powered by Tailwind CSS
