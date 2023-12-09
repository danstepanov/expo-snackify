import * as fs from 'fs-extra';
import * as path from 'path';
import { Snack, SnackOptions } from 'snack-sdk';

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

async function createSnack() {

	// Create a basic App.js file
	const basicAppJs = `import Index from './index';
export default Index;`;
  try {
    // Read files from the current directory
    const files = {}
	const rootPath = process.cwd();
	processDirectory(rootPath, files, rootPath);

	// @ts-ignore
	files['App.js'] = { contents: basicAppJs, type: 'CODE' };

	const options: SnackOptions = {
		name: 'My Expo Snack',
		description: 'Created from my local project',
		files
	};

    const snack = new Snack(options);
    const snackPath = await snack.saveAsync();

    console.log(`Expo Snack URL: https://snack.expo.dev/${snackPath.id}`);
  } catch (error) {
    console.error('Failed to create Expo Snack:', error);
  }
}

createSnack();