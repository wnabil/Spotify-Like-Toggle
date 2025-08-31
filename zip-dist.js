/**
 * @file zip-dist.js
 * @description Zips the packaged Electron app folder into a single .zip file for distribution.
 */

const zipFolder = require('zip-folder');
const path = require('path');

// Path to the packaged Electron app folder (output from electron-packager)
const distFolder = path.join(__dirname, 'dist', 'SpotifyLikeToggle-win32-x64');

// Path and filename for the resulting zip file
const outputZip = path.join(__dirname, 'dist', 'Spotify-Like-Toggle-Setup.zip');

/**
 * Zips the packaged app folder into a single .zip file.
 * 
 * @param {string} sourceFolder - The folder to zip.
 * @param {string} targetZip - The path for the resulting zip file.
 * @param {function(Error|null):void} callback - Callback called when zipping is complete or fails.
 */
zipFolder(distFolder, outputZip, function(err) {
  if (err) {
    // Log any errors that occur during the zipping process
    console.error('Error zipping folder:', err);
  } else {
    // Success message when zip file is created
    console.log('Zip created successfully:', outputZip);
  }
});
