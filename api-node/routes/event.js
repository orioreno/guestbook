var express = require('express');
var router = express.Router();
var eventModel = require('../models/event-model.js');
var response = require('../plugins/response.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/', async function(req, res, next) {
  if (req.body.name && req.body.password) {
    const add = await eventModel.add(req.body.name, req.body.password);
    if (Number.isInteger(add)) return response.success(res, await eventModel.getRow(add));
    return response.error(res, add);
  }
  response.error(res, 400);
});

router.patch('/:id', async function(req, res, next) {
  const edit = await eventModel.edit(req.params.id, req.body);
  if (edit === true) {
    return response.success(res, await eventModel.getRow(req.params.id));
  } else if (edit !== false) {
    return response.error(res, edit);
  }
  response.error(res, 400);
});

router.delete('/:id', async function(req, res, next) {
  const del = await eventModel.edit(req.params.id);
  if (del === true) {
    return response.success(res, 'Event has been deleted');
  }
  response.error(res, 400);
});

module.exports = router;
