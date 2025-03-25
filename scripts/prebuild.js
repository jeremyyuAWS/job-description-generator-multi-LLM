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
    console.error('❌ Error: No example environment file found. Build may fail due to missing environment variables.');
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