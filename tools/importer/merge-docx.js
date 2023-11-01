const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

function mergeAndCleanupFolders(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    return; // Skip non-existent directories
  }

  const directoryItems = fs.readdirSync(directoryPath);

  // Filter the list to find directories that contain numbered DOCX files
  const foldersWithNumberedDOCX = directoryItems.filter(item => {
    const folderPath = path.join(directoryPath, item);

    // Check if the item is a directory
    if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
      // Check if the directory contains numbered DOCX files
      const docxFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.docx'));
      return docxFiles.some(file => /^(\d+)\.docx$/.test(file));
    }

    return false;
  });

  foldersWithNumberedDOCX.forEach(folderName => {
    const folderPath = path.join(directoryPath, folderName);

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

        // Find the parent file one level up in the directory structure
        const parentFileName = `${folderName}.docx`;
        const parentFileNameWithHyphen = `${folderName}-.docx`; // The file name with an ending hyphen

        const parentFilePath = path.join(directoryPath, parentFileName);
        const parentFilePathWithHyphen = path.join(directoryPath, parentFileNameWithHyphen);

        // Check if either of the parent file names exists and append the content
        if (fs.existsSync(parentFilePath)) {
          // Append the content from merged.docx to the parent file
          const tempFilePath = path.join(directoryPath, 'temp.docx');
          execSync(`pandoc ${parentFilePath} ${mergedFileName} -o ${tempFilePath}`);
          fs.renameSync(tempFilePath, parentFilePath); // Rename the temp file to the parent file
          console.log(`Appended content from ${mergedFileName} to ${parentFileName}.`);
        } else if (fs.existsSync(parentFilePathWithHyphen)) {
          // Append the content from merged.docx to the parent file with a hyphen
          const tempFilePath = path.join(directoryPath, 'temp.docx');
          execSync(`pandoc ${parentFilePathWithHyphen} ${mergedFileName} -o ${tempFilePath}`);
          fs.renameSync(tempFilePath, parentFilePathWithHyphen); // Rename the temp file to the parent file with a hyphen
          console.log(`Appended content from ${mergedFileName} to ${parentFileNameWithHyphen}.`);
        }

        // Delete the folder where merged.docx is found
        rimraf.sync(folderPath);
        console.log(`Deleted folder ${folderPath}.`);
      } catch (error) {
        console.error(`Error merging DOCX files for folder ${folderPath}:`, error.message);
      }
    }
  });

  // Recursively process subdirectories
  directoryItems.forEach(item => {
    const itemPath = path.join(directoryPath, item);
    if (fs.existsSync(itemPath) && fs.lstatSync(itemPath).isDirectory()) {
      mergeAndCleanupFolders(itemPath);
    }
  });
}

// Start the process from the current working directory
mergeAndCleanupFolders(process.cwd());
