const fs = require("fs");
const deleteFile = (filePath) => {
  // Deletes the file at this path
  fs.unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
};
exports.deleteFile = deleteFile;
