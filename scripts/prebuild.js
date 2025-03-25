// Prebuild script to ensure environment variables are properly set
import fs from 'fs';
import path from 'path';

// Check if .env.production file exists
const envFile = path.resolve(process.cwd(), '.env.production');
const envExample = path.resolve(process.cwd(), '.env.example');

if (!fs.existsSync(envFile)) {
  console.warn('🚨 Warning: .env.production file is missing!');
  
  if (fs.existsSync(envExample)) {
    console.log('ℹ️  Copying .env.example to .env.production...');
    fs.copyFileSync(envExample, envFile);
    console.log('✅ Created .env.production from example file.');
  } else {
    console.error('❌ Error: No .env.example file found. Please create one with the following required variables:');
    console.error('   - VITE_SUPABASE_URL=your-supabase-url');
    console.error('   - VITE_SUPABASE_ANON_KEY=your-supabase-anon-key');
    console.error('   See README.md for more information on environment configuration.');
    process.exit(1);
  }
}

// Validate critical environment variables
try {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = [];
  
  // Check for critical environment variables
  if (!envContent.includes('VITE_SUPABASE_URL=')) missingVars.push('VITE_SUPABASE_URL');
  if (!envContent.includes('VITE_SUPABASE_ANON_KEY=')) missingVars.push('VITE_SUPABASE_ANON_KEY');
  
  // Check for placeholder values in VITE_SUPABASE_ANON_KEY
  const anonKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
  if (anonKeyMatch) {
    const anonKeyValue = anonKeyMatch[1].trim();
    const placeholderPatterns = [
      '<your_supabase_anon_key_here>',
      'your-supabase-anon-key',
      'your_supabase_anon_key',
      'placeholder',
      'example'
    ];
    
    if (placeholderPatterns.some(pattern => anonKeyValue.toLowerCase().includes(pattern.toLowerCase()))) {
      console.warn('⚠️  WARNING: VITE_SUPABASE_ANON_KEY appears to contain a placeholder value!');
      console.warn('   This will cause authentication failures with Supabase.');
      console.warn('   Please replace it with your actual Supabase anon key.');
    }
  }
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  The following environment variables are missing or empty in .env.production:`);
    missingVars.forEach(v => console.warn(`   - ${v}`));
    console.warn('⚠️  The build may not work correctly without these variables.');
  } else {
    console.log('✅ All required environment variables are present.');
  }
} catch (error) {
  console.error('❌ Error validating environment variables:', error.message);
}

console.log('✅ Prebuild checks completed.');
