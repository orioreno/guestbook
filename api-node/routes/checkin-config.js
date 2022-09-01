var express = require('express');
const app = require('../app.js');
var router = express.Router()
var model
var response = require('../plugins/response.js')

/* MIDDLEWARE to get selected event */
router.use(async function(req, res, next) {
  // get selected event
  eventModel = require('../models/event-model.js')();
  const selectedEvent = await eventModel.getSelected();

  // initialize checkin config model with selected event
  model = require('../models/checkin-config-model.js')(selectedEvent);
  if (model === false) return response.error(res, 503);

  next()
});

/* GET checkin config. */
router.get('/', async function(req, res, next) {
  const data = await model.getConfig();
  response.success(res, data);
});

/* SAVE checkin config. */
router.post('/', async function (req, res, next) {
  const save = await model.saveConfig(req.body);
  if (save) {
    return response.success(res, await model.getConfig());
  }
  response.error(res, 500);
});

module.exports = router;
