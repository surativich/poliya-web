const fs = require('fs');
const path = require('path');
const dirs = ['src/components', 'src/app'];
function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('.toLocaleString(\'uz-UZ\')')) {
        content = content.replace(/\.toLocaleString\('uz-UZ'\)/g, ".toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ' ')");
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}
dirs.forEach(walk);
console.log('Fixed formatting');
