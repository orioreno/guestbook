var express = require('express');
const guestModel = require('../models/guest-model.js');
var router = express.Router();
var model;
var modelGuest;
var modelConfig;
var response = require('../plugins/response.js');

/* MIDDLEWARE to get selected event */
router.use(async function(req, res, next) {
  // get selected event
  eventModel = require('../models/event-model.js')();
  const selectedEvent = await eventModel.getSelected();

  // initialize checkin model with selected event
  model = require('../models/checkin-model.js')(selectedEvent);
  if (model === false) return response.error(res, 503);

  // initialize checkin config model with selected event
  modelConfig = require('../models/checkin-config-model.js')(selectedEvent);
  if (modelConfig === false) return response.error(res, 503);

  // initialize checkin config model with selected event
  modelGuest = require('../models/guest-model.js')(selectedEvent);
  if (modelGuest === false) return response.error(res, 503);

  next();
});

/* GET checkin listing */
router.get('/', async function(req, res, next) {
  const data = await model.getData();
  response.success(res, data);
});

/* GET checkin config. */
router.get('/config', async function(req, res, next) {
  const data = await modelConfig.getConfig();
  response.success(res, data);
});

/* GET checkin by gues tid */
router.get('/:guestId', async function(req, res, next) {
  const data = await model.getData(req.params.guestId);
  response.success(res, data);
});

/* VERIFY AND ADD checkin */
router.post('/', async function(req, res, next) {
  if (req.body.checkin_code) {
    const guest = await modelGuest.getRowByCode(req.body.checkin_code);
    if (guest) {
      const manual = req.body.manual ? 1 : 0;
      const addTime = await model.add(guest.id, manual);
      if (addTime !== false) {
        const config = await modelConfig.getConfig();
        let message = guest.name;
        if (config.success_message) {
          message = config.success_message;
          for (key in guest) {
            message = message.replace('{'+key+'}', String(guest[key]));
          }
        }
        return response.success(res, {
          message: message,
          guest_id: guest.id,
          manual: manual,
          time: addTime
        });
      }
      return response.error(res, 'Failed to save checkin data');
    }
    return response.error(res, 'Invalid check in code');
  }
  response.error(res, 400);
});


/* SAVE checkin config. */
router.post('/config', async function (req, res, next) {
  const save = await modelConfig.saveConfig(req.body);
  if (save) {
    return response.success(res, await model.getConfig());
  }
  response.error(res, 500);
});


module.exports = router;
