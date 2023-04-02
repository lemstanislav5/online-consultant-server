module.exports = (req, res) => {
  try {
    if (fs.existsSync(path.join(__dirname, req.originalUrl))) {
      return res.status(200).sendFile(path.join(__dirname, req.originalUrl));
    }
    return res.status(202).send();
  } catch(err) {
    console.error(err);
  }
}