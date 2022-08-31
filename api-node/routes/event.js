var express = require('express');
var router = express.Router();
var eventModel = require('../models/event-model.js')();
var response = require('../plugins/response.js');

/* GET event listing. */
router.get('/', async function(req, res, next) {
  const data = await eventModel.getData();
  response.success(res, data);
});

/* GET event row by id. */
router.get('/:id', async function(req, res, next) {
  const row = await eventModel.getRow(req.params.id);
  response.success(res, row);
});

/* ADD event. */
router.post('/', async function(req, res, next) {
  if (req.body.name && req.body.password) {
    const add = await eventModel.add(req.body.name, req.body.password);
    if (Number.isInteger(add)) return response.success(res, await eventModel.getRow(add));
    return response.error(res, add);
  }
  response.error(res, 400);
});

/* EDIT event. */
router.patch('/:id', async function(req, res, next) {
  const edit = await eventModel.edit(req.params.id, req.body);
  if (edit === true) {
    return response.success(res, await eventModel.getRow(req.params.id));
  } else if (edit !== false) {
    return response.error(res, edit);
  }
  response.error(res, 400);
});

/* DELETE event. */
router.delete('/:id', async function(req, res, next) {
  const del = await eventModel.delete(req.params.id);
  if (del === true) {
    return response.success(res, 'Event has been deleted');
  }
  response.error(res, 400);
});

/* CHANGE selected event. */
router.patch('/select/:id', async function(req, res, next) {
  const change = await eventModel.changeSelected(req.params.id);
  if (change === true) {
    return response.success(res, 'Selected event has been changed');
  }
  response.error(res, 400);
});

/* GET selected event. */
router.get('/selected', async function(req, res, next) {
  const selected = await eventModel.getSelected();
  response.success(res, selected);
});

/* VERIFY selected event password. */
router.post('/selected/verify', async function(req, res, next) {
  if (req.body.password) {
    const selected = await eventModel.getSelected();
    if (selected) {
      if (await eventModel.verify(selected.id, req.body.password)) {
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
    if (await eventModel.verify(req.params.id, req.body.password)) {
      return response.success(res, "Password verified");
    }
    return response.error(res, 401);
  }
  response.error(res, 400);
});

module.exports = router;
