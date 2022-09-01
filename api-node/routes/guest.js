var express = require('express');
var router = express.Router()
var model;
var response = require('../plugins/response.js');

/* MIDDLEWARE to get selected event */
router.use(async function(req, res, next) {
  // get selected event
  eventModel = require('../models/event-model.js')();
  const selectedEvent = await eventModel.getSelected();

  // initialize guest model with selected event
  model = require('../models/guest-model.js')(selectedEvent);
  if (model === false) return response.error(res, 503);

  next()
});

/* GET guest listing. */
router.get('/', async function(req, res, next) {
  const data = await model.getData();
  response.success(res, data);
});

/* GET guest row by id. */
router.get('/:id', async function(req, res, next) {
  const row = await model.getRow(req.params.id);
  response.success(res, row);
});

/* ADD guest. */
router.post('/', async function(req, res, next) {
  if (req.body.name) {
    const add = await model.add(req.body.name, req.body);
    if (Number.isInteger(add)) return response.success(res, await model.getRow(add));
    return response.error(res, add);
  }
  response.error(res, 400);
});

/* IMPORT guest. */
router.put('/', async function(req, res, next) {
  if (req.body) {
    if (req.body.length > 0) {
      const resp = [];
      await model.deleteAll();
      for (idx in req.body) {
        if ('name' in req.body[idx]) {
          const add = await model.add(req.body[idx].name, req.body[idx]);
          if (Number.isInteger(add)) {
            resp[idx] = await model.getRow(add);
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


/* IMPORT guest. */
router.put('/clone/:sourceid', async function(req, res, next) {
  const sourceData = await model.getData(req.params.sourceid);
  if (sourceData && sourceData.length > 0) {
    const resp = [];
    await model.deleteAll();
    for (idx in sourceData) {
      if ('name' in sourceData[idx]) {
        const add = await model.add(sourceData[idx].name, sourceData[idx]);
        if (Number.isInteger(add)) {
          resp[idx] = await model.getRow(add);
        } else {
          resp[idx] = add;
        }
      } else {
        resp[idx] = 'Name is required';
      }
    }
    return response.success(res, await resp);
  }
  response.error(res, 400);
});

/* EDIT guest. */
router.patch('/:id', async function(req, res, next) {
  const edit = await model.edit(req.params.id, req.body);
  if (edit === true) {
    return response.success(res, await model.getRow(req.params.id));
  } else if (edit !== false) {
    return response.error(res, edit);
  }
  response.error(res, 400);
});

/* DELETE guest. */
router.delete('/:id', async function(req, res, next) {
  const del = await model.delete(req.params.id);
  if (del === true) {
    return response.success(res, 'Guest has been deleted');
  }
  response.error(res, 400);
});

module.exports = router;
