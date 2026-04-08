const fs = require('fs');
const path = require('path');

function splitFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    
    const lines = content.split('\n');
    let header = '';
    let currentClassContent = '';
    let currentClassName = null;
    let braceCount = 0;
    let inClass = false;

    const dir = path.dirname(filePath);

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Count braces for naive nesting check
        let openBraces = (line.match(/\{/g) || []).length;
        let closeBraces = (line.match(/\}/g) || []).length;
        
        if (!inClass) {
            // Check if this line starts a class definition
            // Might have annotations before it
            if (line.match(/(?:public\s+)?(?:class|interface)\s+(\w+)\s*(?:extends|implements|{)/)) {
                
                // If we accumulated annotations in the header, pick them up
                // Let's just find the last annotations
                let annotations = [];
                let hLines = header.split('\n');
                while (hLines.length > 0 && (hLines[hLines.length-1].trim().startsWith('@') || hLines[hLines.length-1].trim() === '' || hLines[hLines.length-1].trim().startsWith('//'))) {
                    annotations.unshift(hLines.pop());
                }
                header = hLines.join('\n') + '\n';
                
                const match = line.match(/(?:class|interface)\s+(\w+)/);
                currentClassName = match[1];
                inClass = true;
                
                // ensuring top-level public
                if (!line.includes('public ')) {
                    line = line.replace(/(class|interface)/, 'public $1');
                }
                
                currentClassContent = annotations.join('\n') + '\n' + line + '\n';
                braceCount = openBraces - closeBraces;
                
                if (braceCount === 0 && line.includes('{') && line.includes('}')) {
                    // One-liner class (e.g. interface empty)
                    fs.writeFileSync(path.join(dir, currentClassName + '.java'), header + currentClassContent, 'utf8');
                    inClass = false;
                    currentClassName = null;
                    currentClassContent = '';
                }
                continue;
            } else {
                header += line + '\n';
            }
        } else {
            currentClassContent += line + '\n';
            braceCount += openBraces - closeBraces;
            
            if (braceCount === 0) {
                // Class finished
                fs.writeFileSync(path.join(dir, currentClassName + '.java'), header + currentClassContent, 'utf8');
                inClass = false;
                currentClassName = null;
                currentClassContent = '';
            }
        }
    }
    fs.unlinkSync(filePath);
}

const basePath = 'c:/Users/anjan/Downloads/tribal-springboot/backend/src/main/java/com/tribal/';
splitFile(path.join(basePath, 'dto/Dtos.java'));
splitFile(path.join(basePath, 'model/AdditionalEntities.java'));
splitFile(path.join(basePath, 'repository/AllRepositories.java'));

try { fs.unlinkSync(path.join(basePath, 'model/Entities.java')); } catch(e) {}
try { fs.unlinkSync(path.join(basePath, 'repository/Repositories.java')); } catch(e) {}
