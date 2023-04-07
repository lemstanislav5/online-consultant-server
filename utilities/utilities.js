class Utilities {
  static ext(name){
      var m = name.match(/\.([^.]+)$/)
      return m && m[1]
    }
  static fileName(type){
    return new Date().getTime() + '.' + type;
  }
  static checkDirectory(dir, fs) {
    console.log(dir)
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(dir)) {
        console.log('!fs.existsSync(dir)')
        fs.mkdir(dir, { recursive: true }, err => {
          if(err) return reject(false);
          resolve(true);
        });
      } else {
        console.log('fs.existsSync(dir)')
        resolve(true);
      }
    });
  }
}

module.exports = Utilities;
