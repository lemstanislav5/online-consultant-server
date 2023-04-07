let express = require('express')
  router = express.Router(),
  // mediaRoutes = require('./mediaRoutes');

  router.use('/media*', (req, res) => {
    console.log(__dirname, req.originalUrl, process.cwd());
    try {
      if (fs.existsSync(path.join(process.cwd(), req.originalUrl))) {
        return res.status(200).sendFile(path.join(process.cwd(), req.originalUrl));
      }
      return res.status(202).send();
    } catch(err) {
      console.error(err);
    }
  })
  /*
    1) Добавление юзера черезщ веб интерфес с логином и паролем, а также подтверждением через емаил или телеграмм???
    Авторизация для пользователя Manager
    Роль для пользователя? Узнать зачем они нужны
    В структуру таблицы Maneger добавить поле пароль
    Создать миделвер с проверкой пользователя и пароля

  */
  module.exports = router;