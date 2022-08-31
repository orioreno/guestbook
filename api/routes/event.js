var express = require('express');
var router = express.Router();
var eventModel = require('../models/event-model.js');
var response = require('../plugins/response.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', async (req, res, next) => {
  if (req.body.name && req.body.password) {
    const add = await eventModel.add(req.body.name, req.body.password);
    if (Number.isInteger(add)) return response.success(res, add);
    return response.error(res, add);
  }
  response.error(res, 400);
});

router.patch('/:id', async (req, res, next) => {
  const edit = await eventModel.edit(req.params.id, req.body);
});

module.exports = router;
