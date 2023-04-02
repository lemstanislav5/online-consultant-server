let express = require('express')
  router = express.Router(),
  mediaRoutes = require('./mediaRoutes');

  router.use('/media*', mediaRoutes)

  module.exports = router;