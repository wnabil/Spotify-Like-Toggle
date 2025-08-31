const zipFolder = require('zip-folder');
const path = require('path');

const distFolder = path.join(__dirname, 'dist', 'SpotifyLikeToggle-win32-x64');
const outputZip = path.join(__dirname, 'dist', 'Spotify-Like-Toggle-Setup.zip');

zipFolder(distFolder, outputZip, function(err) {
  if(err) {
    console.error('Error zipping folder:', err);
  } else {
    console.log('Zip created successfully:', outputZip);
  }
});
