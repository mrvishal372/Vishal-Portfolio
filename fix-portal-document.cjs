const fs = require('fs');

function fixDocumentPropConflict(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Replace document.body with window.document.body
  code = code.replace(/document\.body/g, 'window.document.body');
  // Replace typeof document === 'undefined' with typeof window === 'undefined'
  code = code.replace(/typeof document === 'undefined'/g, "typeof window === 'undefined' || typeof window.document === 'undefined'");

  fs.writeFileSync(filePath, code);
  console.log("Fixed DOM document conflict in", filePath);
}

fixDocumentPropConflict('src/components/profile/DocumentPreviewModal.tsx');
fixDocumentPropConflict('src/components/profile/EditProfileModal.tsx');
fixDocumentPropConflict('src/components/profile/ProfilePhotoZoomModal.tsx');
