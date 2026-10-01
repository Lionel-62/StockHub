const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('backdrop-blur')) {
      // Replace non-responsive backdrop-blur with sm:backdrop-blur
      // Care to not replace already sm:backdrop-blur 
      let newContent = content.replace(/(?<!sm:)backdrop-blur-(sm|md|lg)/g, 'sm:backdrop-blur-$1');
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log("Updated: " + filePath);
      }
    }
  }
});
