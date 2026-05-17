const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /bg-white/g, replace: 'bg-[var(--surface)]' },
  { search: /bg-\[\#FFFFFF\]/g, replace: 'bg-[var(--surface)]' },
  { search: /text-\[\#2E2E2E\]/g, replace: 'text-[var(--text-primary)]' },
  { search: /text-\[\#C4A484\]/g, replace: 'text-[var(--accent-gold)]' },
  { search: /text-\[\#6B6B6B\]/g, replace: 'text-[var(--text-secondary)]' },
  { search: /text-\[\#9B8B7A\]/g, replace: 'text-[var(--text-secondary)]' },
  { search: /text-\[\#E8A0B0\]/g, replace: 'text-[var(--pink-medium)]' },
  { search: /bg-\[\#F6F2EA\]/g, replace: 'bg-[var(--background)]' },
  { search: /border-\[\#EDE6DA\]/g, replace: 'border-[var(--border-color)]' },
  { search: /border-\[\#F6F2EA\]/g, replace: 'border-[var(--border-color)]' },
  { search: /border-\[\#F0E6D3\]/g, replace: 'border-[var(--border-color)]' },
  { search: /bg-\[\#EDE6DA\]/g, replace: 'bg-[var(--soft-beige)]' },
  { search: /bg-\[\#F2C4CE\]/g, replace: 'bg-[var(--pink-soft)]' },
  { search: /bg-\[\#FAE8ED\]/g, replace: 'bg-[var(--pink-light)]' },
  { search: /bg-\[\#E8A0B0\]/g, replace: 'bg-[var(--pink-medium)]' },
  { search: /border-\[\#C4A484\]/g, replace: 'border-[var(--accent-gold)]' },
  { search: /border-\[\#E8A0B0\]/g, replace: 'border-[var(--pink-medium)]' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { search, replace } of replacements) {
        content = content.replace(search, replace);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src', 'components'));
processDirectory(path.join(__dirname, 'src', 'app'));

console.log('Done.');
