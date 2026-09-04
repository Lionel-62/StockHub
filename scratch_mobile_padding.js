const fs = require('fs');
const path = require('path');

const dir = 'src/app/(dashboard)/dashboard';

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && name === 'page.tsx') {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

walkSync(dir, function(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    let newCode = code;

    // Replace padding classes on the main wrapper
    // We want to reduce padding on mobile (e.g. p-6 md:p-8 -> p-3 md:p-0 since layout already has md:p-8)
    // Wait, if layout has md:p-8, then pages shouldn't have any padding on md, OR layout should have p-0 and pages handle their own padding.
    // If layout has md:p-8, adding md:p-0 to pages is perfect.
    
    // So on mobile (where layout is p-0), page should have p-3 or p-2. Let's use p-3 (12px) for general wrapper padding so titles are not touching the screen edge.
    newCode = newCode.replace(/className="p-6 md:p-8/g, 'className="p-3 md:p-0');
    newCode = newCode.replace(/className="p-4 md:p-8/g, 'className="p-3 md:p-0');
    newCode = newCode.replace(/className="p-4 md:p-6/g, 'className="p-3 md:p-0');

    // For cards containing lists/tables, we want to remove borders and border radius on mobile
    // Search for <Card className="shadow-none border-0 ring-0 bg-transparent sm:bg-white sm:shadow-sm sm:ring-1 sm:ring-slate-200 rounded-xl overflow-visible">
    // and make sure it has rounded-none sm:rounded-xl
    
    // Many cards are just <Card className="shadow-none ...">
    newCode = newCode.replace(/<Card className="([^"]*)rounded-xl([^"]*)">/g, (match, p1, p2) => {
        if (!p1.includes('rounded-none') && !p2.includes('rounded-none')) {
           return `<Card className="${p1}rounded-none sm:rounded-xl${p2} border-x-0 sm:border-x">`;
        }
        return match;
    });

    if (code !== newCode) {
        fs.writeFileSync(filePath, newCode);
        console.log("Updated", filePath);
    }
});
