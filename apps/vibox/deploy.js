#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Deploying VIBox to Vercel...');

try {
  // Try to deploy using Vercel CLI
  execSync('npx vercel --prod', { stdio: 'inherit' });
  console.log('✅ VIBox deployed successfully!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('\n💡 Alternative: Deploy manually via Vercel dashboard');
  console.log('📁 Upload files to: https://vercel.com/new');
  process.exit(1);
}
