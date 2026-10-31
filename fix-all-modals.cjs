const fs = require('fs');

function applyToModal(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Make sure createPortal is imported
  if (!code.includes("import { createPortal }")) {
    code = code.replace("import React", "import { createPortal } from 'react-dom';\nimport React");
  }

  // If there's an early return, comment it out so AnimatePresence works properly
  code = code.replace(/if \(!isOpen[^\n]*\n/g, '// early return removed for exit animation\n');
  code = code.replace(/if \(!isOpen\)[^\n]*\n/g, '// early return removed\n');
  
  // We need to safely wrap the return with createPortal if it's not already
  if (!code.includes('return createPortal(')) {
    code = code.replace(/return \(\n\s*<AnimatePresence>/, "if (typeof window === 'undefined' || typeof window.document === 'undefined') return null;\n  return createPortal(\n    <AnimatePresence>");
    
    // Close the portal
    code = code.replace(/<\/AnimatePresence>\n\s*\);\n\};/, "</AnimatePresence>,\n    window.document.body\n  );\n};");
  }

  // We need to make sure the inner content is conditional on `isOpen`
  if (!code.includes('{isOpen && (')) {
    code = code.replace(/<AnimatePresence>\n\s*<motion\.div/, "<AnimatePresence>\n      {isOpen && (\n      <motion.div");
    code = code.replace(/<\/motion\.div>\n\s*<\/AnimatePresence>/, "</motion.div>\n      )}\n    </AnimatePresence>");
    
    code = code.replace(/<AnimatePresence>\n\s*<div/, "<AnimatePresence>\n      {isOpen && (\n      <div");
    code = code.replace(/<\/div>\n\s*<\/AnimatePresence>/, "</div>\n      )}\n    </AnimatePresence>");
  }
  
  // For DocumentPreviewModal specifically, `document` prop might be null when `isOpen` is false (or even just closing).
  // This causes crashes when evaluating `document.fileType` unconditionally.
  // We must wrap the calculation or provide fallback.
  if (filePath.includes('DocumentPreviewModal')) {
    code = code.replace(/const isImage = document\.fileType/g, "const isImage = document?.fileType");
    code = code.replace(/document\.fileName\?/g, "document?.fileName?");
    code = code.replace(/const isText = document\.fileType/g, "const isText = document?.fileType");
    code = code.replace(/document\.textContent/g, "document?.textContent");
    code = code.replace(/document\.fileDataUrl/g, "document?.fileDataUrl");
    code = code.replace(/document\.title/g, "document?.title");
  }

  fs.writeFileSync(filePath, code);
  console.log("Fully fixed:", filePath);
}

applyToModal('src/components/profile/EditProfileModal.tsx');
applyToModal('src/components/profile/DocumentPreviewModal.tsx');
applyToModal('src/components/profile/ProfilePhotoZoomModal.tsx');
