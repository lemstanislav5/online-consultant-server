const process = require('process');
const fs = require("fs");

module.exports = (req, res) => {
  console.log(__dirname, req.originalUrl, process.cwd());
  try {
    if (fs.existsSync(path.join(process.cwd(), req.originalUrl))) {
      return res.status(200).sendFile(path.join(process.cwd(), req.originalUrl));
    }
    return res.status(202).send();
  } catch(err) {
    console.error(err);
  }
}