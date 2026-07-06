const fs = require('fs');
const path = require('path');
const Module = require('module');

// Mock @contexts since it is an app-level alias not defined in the library
const originalRequire = Module.prototype.require;
Module.prototype.require = function(request) {
    if (request === '@contexts') {
        return {
            useToggleContext: () => ({ toggle: {}, setToggle: () => {} }),
            useAuthContext: () => ({ setUser: () => {}, setAccessToken: () => {} }),
        };
    }
    return originalRequire.apply(this, arguments);
};

const targetFile = path.resolve(__dirname, 'dist/index.js');
const targetDir = path.dirname(targetFile);

if (!fs.existsSync(targetFile)) {
    console.error('Build output dist/index.js not found!');
    process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');

const regex = /__exportStar\(require\("([^"]+)"\),\s*exports\);/g;

let match;
const replacements = [];

while ((match = regex.exec(content)) !== null) {
    const fullLine = match[0];
    const relPath = match[1];
    
    const resolvedPath = path.resolve(targetDir, relPath);
    
    try {
        const mod = require(resolvedPath);
        const keys = Object.keys(mod).filter(k => k !== '__esModule' && k !== 'default');
        
        let staticExports = `// Static export for ${relPath}\n`;
        for (const key of keys) {
            staticExports += `exports.${key} = require("${relPath}").${key};\n`;
        }
        
        replacements.push({ target: fullLine, replacement: staticExports });
    } catch (err) {
        console.error('Failed to load ' + resolvedPath + ':', err.message);
    }
}

for (const r of replacements) {
    content = content.replace(r.target, r.replacement);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully fixed entry exports dynamically in postbuild!');
