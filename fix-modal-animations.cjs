const fs = require('fs');

function fixModal(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Remove the early return for isOpen
  code = code.replace(/if \(!isOpen[\s\S]*?\) return null;\n/g, '');
  
  // Find <AnimatePresence> and wrap the content in {isOpen && ( ... )}
  if (code.includes('<AnimatePresence>\n      <div')) {
    code = code.replace(
      '<AnimatePresence>\n      <div',
      '<AnimatePresence>\n      {isOpen && (\n      <div'
    );
    code = code.replace(
      /<\/div>\n    <\/AnimatePresence>/,
      '</div>\n      )}\n    </AnimatePresence>'
    );
  } else if (code.includes('<AnimatePresence>\n      <motion.div')) {
    code = code.replace(
      '<AnimatePresence>\n      <motion.div',
      '<AnimatePresence>\n      {isOpen && (\n      <motion.div'
    );
    code = code.replace(
      /<\/motion.div>\n    <\/AnimatePresence>/,
      '</motion.div>\n      )}\n    </AnimatePresence>'
    );
  }

  fs.writeFileSync(filePath, code);
  console.log("Fixed animations for", filePath);
}

fixModal('src/components/profile/DocumentPreviewModal.tsx');
fixModal('src/components/profile/ProfilePhotoZoomModal.tsx');
