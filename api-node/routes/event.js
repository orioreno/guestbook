var express = require('express');
var router = express.Router();
var model = require('../models/event-model.js')();
var response = require('../plugins/response.js');

/* GET event listing. */
router.get('/', async function(req, res, next) {
  const data = await model.getData();
  response.success(res, data);
});

/* GET selected event. */
router.get('/selected', async function(req, res, next) {
  const selected = await model.getSelected();
  if (selected) {
    return response.success(res, selected);
  }
  response.error(res, 'No event selected');
});

/* GET event row by id. */
router.get('/:id', async function(req, res, next) {
  const row = await model.getRow(req.params.id);
  response.success(res, row);
});

/* ADD event. */
router.post('/', async function(req, res, next) {
  if (req.body.name && req.body.password) {
    const add = await model.add(req.body.name, req.body.password);
    if (Number.isInteger(add)) return response.success(res, await model.getRow(add));
    return response.error(res, add);
  }
  response.error(res, 400);
});

/* VERIFY selected event password. */
router.post('/selected/verify', async function(req, res, next) {
  if (req.body.password) {
    const selected = await model.getSelected();
    if (selected) {
      if (await model.verify(selected.id, req.body.password)) {
        return response.success(res, "Password verified");
      }
    }
    return response.error(res, 401);
  }
  response.error(res, 400);
});

/* VERIFY event password by id. */
router.post('/verify/:id', async function(req, res, next) {
  if (req.body.password) {
    if (await model.verify(req.params.id, req.body.password)) {
      return response.success(res, "Password verified");
    }
    return response.error(res, 401);
  }
  response.error(res, 400);
});

/* EDIT selected event. */
router.patch('/', async function(req, res, next) {
  const edit = await model.edit(req.body);
  if (edit === true) {
    return response.success(res, await model.getSelected());
  } else if (edit !== false) {
    return response.error(res, edit);
  }
  response.error(res, 400);
});

/* CHANGE selected event. */
router.patch('/select/:id', async function(req, res, next) {
  const change = await model.changeSelected(req.params.id);
  if (change === true) {
    return response.success(res, 'Selected event has been changed');
  }
  response.error(res, 400);
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
