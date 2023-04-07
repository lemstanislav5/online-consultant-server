let express = require('express')
  router = express.Router(),
  mediaRoutes = require('.//mediaRoutes');

  router.use('/media*', mediaRoutes)
  /*
    1) Добавление юзера черезщ веб интерфес с логином и паролем, а также подтверждением через емаил или телеграмм???
    Авторизация для пользователя Manager
    Роль для пользователя? Узнать зачем они нужны
    В структуру таблицы Maneger добавить поле пароль
    Создать миделвер с проверкой пользователя и пароля

  */
  module.exports = router;