const fs = require("fs").promises;

/* copy file */
exports.copyFile = async (srcFile, destFile) => {
  try {
    return await fs.copyFile(`public/${srcFile}`, `public/${destFile}`);
  } catch (err) {
    return err;
  }
};

/* read file */
exports.readFile = async (file) => {
  try {
    return await fs.readFile(`public/${file}`, "utf8");
  } catch (err) {
    return err;
  }
};

/* write File */
exports.writeFile = async (file, data) => {
  try {
    return await fs.writeFile(`public/${file}`, data, "utf8");
  } catch (err) {
    return err;
  }
};

/* replace file data */
exports.replaceFile = async (file) => {
  return file;
};
