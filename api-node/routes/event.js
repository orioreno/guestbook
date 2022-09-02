var express = require('express');
var router = express.Router();
var model = require('../models/event-model.js')();

/* GET event listing. */
router.get('/', async function(req, res, next) {
  res.json(await model.getData());
});

/* GET selected event. */
router.get('/selected', async function(req, res, next) {
  res.json(await model.getSelected());
});

/* GET event row by id. */
router.get('/:id', async function(req, res, next) {
  res.json(await model.getRow(req.params.id));
});

/* ADD event. */
router.post('/', async function(req, res, next) {
  if (req.body.name && req.body.password) {
    const add = await model.add(req.body.name, req.body.password);
    if (Number.isInteger(add)) return res.json(await model.getRow(add));

    return res.status(580).json(add);
  }
  res.send(400);
});

/* VERIFY selected event password. */
router.post('/selected/verify', async function(req, res, next) {
  if (req.body.password) {
    const selected = await model.getSelected();
    if (selected) {
      if (await model.verify(selected.id, req.body.password)) {
        return res.json("Password verified");
      }
    }
    return res.send(401);
  }
  res.send(400);
});

/* VERIFY event password by id. */
router.post('/verify/:id', async function(req, res, next) {
  if (req.body.password) {
    if (await model.verify(req.params.id, req.body.password)) {
      return res.json("Password verified");
    }
    return res.send(401);
  }
  res.send(400);
});

/* EDIT selected event. */
router.patch('/', async function(req, res, next) {
  const edit = await model.edit(req.body);
  if (edit === true) {
    return res.json(await model.getSelected());
  } else if (edit !== false) {
    return res.status(580).json(edit);
  }
  res.send(400);
});

/* CHANGE selected event. */
router.patch('/select/:id', async function(req, res, next) {
  const selected = await model.changeSelected(req.params.id);
  if (selected) return res.json(selected);
  res.send(400);
});


/* DELETE selected event. */
router.delete('/', async function(req, res, next) {
  const del = await model.delete();
  if (del === true) {
    return response.success(res, 'Event has been deleted');
  }
  response.error(res, 400);
});


module.exports = router;
