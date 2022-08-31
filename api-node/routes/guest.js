var express = require('express');
var router = express.Router()
var guestModel;
var response = require('../plugins/response.js');

/* MIDDLEWARE to get selected event */
router.use(async function(req, res, next) {
  // get selected event
  eventModel = require('../models/event-model.js')();
  const selectedEvent = await eventModel.getSelected();

  // initialize guest model with selected event
  guestModel = require('../models/guest-model.js')(selectedEvent);
  if (guestModel === false) return response.error(res, 503);

  next()
});

/* GET guest listing. */
router.get('/', async function(req, res, next) {
  const data = await guestModel.getData();
  response.success(res, data);
});

/* GET guest row by id. */
router.get('/:id', async function(req, res, next) {
  const row = await guestModel.getRow(req.params.id);
  response.success(res, row);
});

/* ADD guest. */
router.post('/', async function(req, res, next) {
  if (req.body.name) {
    const add = await guestModel.add(req.body.name, req.body);
    if (Number.isInteger(add)) return response.success(res, await guestModel.getRow(add));
    return response.error(res, add);
  }
  response.error(res, 400);
});

/* IMPORT guest. */
router.post('/import', async function(req, res, next) {
  if (req.body) {
    if (req.body.length > 0) {
      const resp = [];
      for (idx in req.body) {
        if ('name' in req.body[idx]) {
          const add = await guestModel.add(req.body[idx].name, req.body[idx]);
          if (Number.isInteger(add)) {
            resp[idx] = await guestModel.getRow(add);
          } else {
            resp[idx] = add;
          }
        } else {
          resp[idx] = 'Name is required';
        }
      }
      return response.success(res, await resp);
    }
  }
  response.error(res, 400);
});

/* EDIT guest. */
router.patch('/:id', async function(req, res, next) {
  const edit = await guestModel.edit(req.params.id, req.body);
  if (edit === true) {
    return response.success(res, await guestModel.getRow(req.params.id));
  } else if (edit !== false) {
    return response.error(res, edit);
  }
  response.error(res, 400);
});

/* DELETE guest. */
router.delete('/:id', async function(req, res, next) {
  const del = await guestModel.delete(req.params.id);
  if (del === true) {
    return response.success(res, 'Guest has been deleted');
  }
  response.error(res, 400);
});

module.exports = router;
