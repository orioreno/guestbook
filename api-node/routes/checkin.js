var express = require('express');
var router = express.Router()
var model;
var response = require('../plugins/response.js');

/* MIDDLEWARE to get selected event */
router.use(async function(req, res, next) {
  // get selected event
  eventModel = require('../models/event-model.js')();
  const selectedEvent = await eventModel.getSelected();

  // initialize checkin config model with selected event
  model = require('../models/checkin-model.js')(selectedEvent);
  if (model === false) return response.error(res, 503);

  next()
});

/* GET checkin config. */
router.get('/config', async function(req, res, next) {
  const data = await model.getConfig();
  response.success(res, data);
});

/* SAVE checkin config. */
router.post('/config', async function (req, res, next) {
  const save = await model.saveConfig(req.body);
  (save === true) ? response.success(res, await model.getConfig()) : response.error(res, 500);
});

module.exports = router;
