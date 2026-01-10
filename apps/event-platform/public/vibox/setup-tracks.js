// VIBox Track Setup Helper
// This script automatically generates tracks.json from MP3 files in this directory

const fs = require('fs');
const path = require('path');

const viboxDir = __dirname;
const tracksDir = viboxDir;

// Function to scan for audio files
function scanAudioFiles() {
  const files = fs.readdirSync(tracksDir);
  const audioExtensions = ['.mp3', '.wav', '.flac', '.aac'];
  
  return files
    .filter(file => audioExtensions.includes(path.extname(file).toLowerCase()))
    .filter(file => !file.includes('tracks.json') && !file.includes('setup-tracks.js') && file !== 'README.md');
}

// Function to generate tracks.json
function generateTracksJSON() {
  const audioFiles = scanAudioFiles();
  
  console.log(`Found ${audioFiles.length} audio files:`);
  audioFiles.forEach(file => {
    console.log(`  - ${file}`);
  });

  // Write tracks.json
  const tracksJSON = JSON.stringify(audioFiles, null, 2);
  fs.writeFileSync(path.join(tracksDir, 'tracks.json'), tracksJSON);
  
  console.log(`\n✅ Generated tracks.json with ${audioFiles.length} files`);
  
  if (audioFiles.length === 0) {
    console.log('\nTo add tracks:');
    console.log('1. Copy MP3 files to this directory');
    console.log('2. Run: node setup-tracks.js');
    console.log('3. Rebuild and deploy to Vercel');
  } else {
    console.log('\nYour tracks will be available at:');
    audioFiles.forEach(file => {
      console.log(`  https://your-domain.vercel.app/vibox/${file}`);
    });
    console.log('\n✅ Ready for deployment!');
  }
}

// Run the script
generateTracksJSON();
