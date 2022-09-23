var express = require('express');
var router = express.Router();
var model;

/* MIDDLEWARE to get selected event */
router.use(async function(req, res, next) {
  // get selected event
  eventModel = require('../models/event-model.js')();
  const selectedEvent = await eventModel.getSelected();

  // initialize guest model with selected event
  model = require('../models/guest-model.js')(selectedEvent);
  if (model === false) return res.send(503);

  next()
});

/* GET guest listing. */
router.get('/', async function(req, res, next) {
  res.json(await model.getData());
});

/* GET guest row by id. */
router.get('/:id', async function(req, res, next) {
  res.json(await model.getRow(req.params.id));
});

/* ADD guest. */
router.post('/', async function(req, res, next) {
  if (req.body.name) {
    const add = await model.add(req.body.name, req.body);
    if (Number.isInteger(add)) return res.json(await model.getRow(add));
    return res.status(580).json(add);
  }
  res.send(400);
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
      return res.json(await resp);
    }
  }
  res.send(400);
});


/* CLONE guest from other event. */
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

    return res.json(await resp);
  }
  res.send(400);
});

/* EDIT guest. */
router.patch('/:id', async function(req, res, next) {
  const edit = await model.edit(req.params.id, req.body);
  if (edit === true) {
    return res.json(await model.getRow(req.params.id));
  } else if (edit !== false) {
    return res.status(580).json(edit);
  }
  res.send(400);
});

/* DELETE guest. */
router.delete('/:id', async function(req, res, next) {
  const del = await model.delete(req.params.id);
  if (del === true) {
    return res.json('Guest has been deleted');
  }
  res.send(400);
});

module.exports = router;
