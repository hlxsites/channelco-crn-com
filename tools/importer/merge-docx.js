const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get the current working directory
const workingDirectory = process.cwd();

// Get a list of all items (files and directories) in the working directory
const directoryItems = fs.readdirSync(workingDirectory);

// Filter the list to find directories that contain numbered DOCX files
const foldersWithNumberedDOCX = directoryItems.filter(item => {
  const itemPath = path.join(workingDirectory, item);

  // Check if the item is a directory
  if (fs.lstatSync(itemPath).isDirectory()) {
    // Check if the directory contains numbered DOCX files
    const docxFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.docx'));
    return docxFiles.some(file => /^(\d+)\.docx$/.test(file));
  }

  return false;
});

if (foldersWithNumberedDOCX.length === 0) {
  console.log('No folders found with numbered DOCX files in the working directory.');
} else {
  foldersWithNumberedDOCX.forEach(folderName => {
    const folderPath = path.join(workingDirectory, folderName);

    // Find numbered DOCX files in the folder
    const numberedDocxFiles = fs.readdirSync(folderPath)
      .filter(file => file.endsWith('.docx') && /^(\d+)\.docx$/.test(file))
      .sort((a, b) => {
        const aNumber = parseInt(a.match(/^(\d+)\.docx$/)[1]);
        const bNumber = parseInt(b.match(/^(\d+)\.docx$/)[1]);
        return aNumber - bNumber;
      });

    if (numberedDocxFiles.length === 0) {
      console.log(`No numbered DOCX files found in ${folderPath}.`);
    } else {
      // Build the Pandoc command to merge all the DOCX files
      const mergedFileName = path.join(folderPath, 'merged.docx');
      const mergeCommand = `pandoc ${numberedDocxFiles.map(file => path.join(folderPath, file)).join(' ')} -o ${mergedFileName}`;

      try {
        // Execute the Pandoc command to merge the files
        execSync(mergeCommand);
        console.log(`Merged ${numberedDocxFiles.length} DOCX files into ${mergedFileName}.`);
        
        // Delete individual numbered DOCX files after successful merge
        numberedDocxFiles.forEach(file => {
          const filePath = path.join(folderPath, file);
          fs.unlinkSync(filePath);
        });
        console.log(`Deleted individual numbered DOCX files in ${folderPath}.`);
      } catch (error) {
        console.error(`Error merging DOCX files for folder ${folderPath}:`, error.message);
      }
    }
  });
}
