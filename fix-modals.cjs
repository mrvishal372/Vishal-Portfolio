const fs = require('fs');

function applyPortal(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  if (!code.includes("import { createPortal } from 'react-dom';")) {
    code = code.replace(
      "import React,", 
      "import { createPortal } from 'react-dom';\nimport React,"
    );
  }

  // Find the return statement of the component.
  // It usually looks like:
  // return (
  //   <AnimatePresence>
  // or
  // return (
  //   <div
  
  if (code.includes('return (\n    <AnimatePresence>')) {
    code = code.replace(
      /return \(\n\s*<AnimatePresence>/,
      "if (typeof document === 'undefined') return null;\n  return createPortal(\n    <AnimatePresence>"
    );
    // Now we need to close the portal.
    // The component usually ends with:
    //     </AnimatePresence>\n  );\n};
    code = code.replace(
      /<\/AnimatePresence>\n\s*\);\n\};/,
      "</AnimatePresence>,\n    document.body\n  );\n};"
    );
  } else if (code.includes('return (\n    <div')) {
     code = code.replace(
      /return \(\n\s*<div/,
      "if (typeof document === 'undefined') return null;\n  return createPortal(\n    <div"
    );
    // Find the end:
    //     </div>\n  );\n};
     code = code.replace(
      /<\/div>\n\s*\);\n\};/,
      "</div>,\n    document.body\n  );\n};"
    );
  }
  
  fs.writeFileSync(filePath, code);
  console.log("Patched", filePath);
}

applyPortal('src/components/profile/EditProfileModal.tsx');
applyPortal('src/components/profile/DocumentPreviewModal.tsx');
applyPortal('src/components/profile/ProfilePhotoZoomModal.tsx');
