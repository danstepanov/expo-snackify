"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const snack_sdk_1 = require("snack-sdk");
function processDirectory(dirPath, snackFiles, rootPath) {
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
        }
        else if (stat.isDirectory()) {
            processDirectory(fullPath, snackFiles, rootPath);
        }
    });
}
;
function createSnack() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a basic App.js file
        const basicAppJs = `import Index from './index';
export default Index;`;
        try {
            // Read files from the current directory
            const files = {};
            const rootPath = process.cwd();
            processDirectory(rootPath, files, rootPath);
            // @ts-ignore
            files['App.js'] = { contents: basicAppJs, type: 'CODE' };
            const options = {
                name: 'My Expo Snack',
                description: 'Created from my local project',
                files
            };
            const snack = new snack_sdk_1.Snack(options);
            const snackPath = yield snack.saveAsync();
            console.log(`Expo Snack URL: https://snack.expo.dev/${snackPath.id}`);
        }
        catch (error) {
            console.error('Failed to create Expo Snack:', error);
        }
    });
}
createSnack();
