#!/usr/bin/env node

import * as fs from 'fs-extra';
import * as path from 'path';
import { Snack, SnackOptions } from 'snack-sdk';
// @ts-ignore
import { Select } from 'enquirer';

function processDirectory(dirPath: string, snackFiles: any, rootPath: string) {
  const entries = fs.readdirSync(dirPath);

  entries.forEach(entry => {
    // Skip node_modules or any other directories
    if (entry === 'node_modules' || entry === '.git') {
      return;
    }

    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isFile()) {
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      const relativePath = path.relative(rootPath, fullPath);
      snackFiles[`${relativePath}`] = { contents: fileContent, type: 'CODE' };
    } else if (stat.isDirectory()) {
      processDirectory(fullPath, snackFiles, rootPath);
    }
  });
};

function isExpoProject(directory: string) {
  const appJsonPath = path.join(directory, 'app.json');
  const nodeModulesPath = path.join(directory, 'node_modules', 'expo');

  return fs.existsSync(appJsonPath) && fs.existsSync(nodeModulesPath);
}

async function createSnack() {
  // Check if the current directory is an Expo project
  if (!isExpoProject(process.cwd())) {
    console.error('Error: The current directory does not appear to be an Expo project.');
    return;
  }

  try {
    const prompt = new Select({
      name: 'platform',
      message: 'Choose a simulator platform:',
      choices: ['iOS', 'Android', 'Web (Experimental)']
    });

    const platformChoice = await prompt.run();

    console.log(`Generating your Snack URL...`);

    // Read files from the current directory
    const files = {}
    const rootPath = process.cwd();
    processDirectory(rootPath, files, rootPath);

    // Snack requires an App.js file
    // Check if there is an App.js file
    // If not, create a basic one
    // @ts-ignore
    if (!files['App.js'] || !files['App.jsx'] || !files['App.tsx'] || !files['App.ts']) {
      const basicAppJs = `import Index from './index';
export default Index;`;
      // @ts-ignore
      files['App.js'] = { contents: basicAppJs, type: 'CODE' };
    }

    const options: SnackOptions = {
      name: 'My Expo Snack',
      description: 'Created from my local project',
      files
    };

    const snack = new Snack(options);
    const snackPath = await snack.saveAsync();

    let platformUrl = `https://snack.expo.dev/${snackPath.id}`;

    switch (platformChoice) {
      case 'Android':
        platformUrl += '?platform=android';
        break;
      case 'Web (Experimental)':
        break;
      case 'iOS':
      default:
        platformUrl += '?platform=ios';
        break;
    }

    console.log(`Expo Snack URL: ${platformUrl}`);
  } catch (error) {
    console.error('Failed to create Expo Snack:', error);
    console.error('Please create an issue at https://github.com/danstepanov/expo-snackify/issues');
  }
}

createSnack();