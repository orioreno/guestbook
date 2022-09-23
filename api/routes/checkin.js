var express = require('express');
const guestModel = require('../models/guest-model.js');
var router = express.Router();
var model;
var modelGuest;
var modelConfig;

/* MIDDLEWARE to get selected event */
router.use(async function(req, res, next) {
  // get selected event
  eventModel = require('../models/event-model.js')();
  const selectedEvent = await eventModel.getSelected();

  // initialize checkin model with selected event
  model = require('../models/checkin-model.js')(selectedEvent);
  if (model === false) return res.send(503);

  // initialize checkin config model with selected event
  modelConfig = require('../models/checkin-config-model.js')(selectedEvent);
  if (modelConfig === false) return res.send(503);

  // initialize checkin config model with selected event
  modelGuest = require('../models/guest-model.js')(selectedEvent);
  if (modelGuest === false) return res.send(503);

  next();
});

/* GET checkin listing */
router.get('/', async function(req, res, next) {
  const data = await model.getData();
  res.json(data);
});

/* GET checkin config. */
router.get('/config', async function(req, res, next) {
  const data = await modelConfig.getConfig();
  res.json(data);
});

/* GET checkin by gues tid */
router.get('/:guestId', async function(req, res, next) {
  const data = await model.getData(req.params.guestId);
  res.json(data);
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
        if (config && config.success_message) {
          message = config.success_message;
          for (key in guest) {
            message = message.replace('{'+key+'}', String(guest[key]));
          }
        }
        return res.json({
          message: message,
          guest_id: guest.id,
          manual: manual,
          time: addTime
        });
      }
      return res.status(580).json('Failed to save checkin data');
    }
    return res.status(580).json('Invalid check in code');
  }
  res.send(400);
});


/* EDIT checkin config. */
router.patch('/config', async function (req, res, next) {
  const save = await modelConfig.saveConfig(req.body);
  if (save) {
    return res.json(await modelConfig.getConfig());
  }
  res.send(500);
});


module.exports = router;
