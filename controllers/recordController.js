const recordModel = require('../models/recordModel');

// GET /records/create
exports.getCreateRecord = (req, res) => {
  res.render('create-record', {
    title: 'Create Record',
    csrfToken: req.csrfToken(),
    layout: 'main',
  });
};

// POST /records
exports.postCreateRecord = (req, res) => {
  const { date, vehicleType, liters, distanceKm, totalCost } = req.body;

  if (!date || !vehicleType || !liters || !distanceKm || !totalCost) {
    req.session.flash = 'All fields are required.';
    return res.redirect('/records/create');
  }

  const userId = req.session.user.id;
  recordModel.createRecord({
    userId,
    date,
    vehicleType,
    liters,
    distanceKm,
    totalCost,
  });

  req.session.flash = 'Record created successfully.';
  res.redirect('/dashboard');
};

// GET /records/:id/edit
exports.getEditRecord = (req, res) => {
  const { id } = req.params;
  const record = recordModel.findRecordById(id);
  const userId = req.session.user.id;

  if (!record || record.userId !== userId) {
    return res.status(404).send('Record not found');
  }

  res.render('edit-record', {
    title: 'Edit Record',
    csrfToken: req.csrfToken(),
    record,
    layout: 'main',
  });
};

// POST /records/:id
exports.postEditRecord = (req, res) => {
  const { id } = req.params;
  const { date, vehicleType, liters, distanceKm, totalCost } = req.body;
  const userId = req.session.user.id;

  const record = recordModel.findRecordById(id);
  if (!record || record.userId !== userId) {
    return res.status(404).send('Record not found');
  }

  if (!date || !vehicleType || !liters || !distanceKm || !totalCost) {
    req.session.flash = 'All fields are required.';
    return res.redirect(`/records/${id}/edit`);
  }

  recordModel.updateRecord(id, {
    date,
    vehicleType,
    liters,
    distanceKm,
    totalCost,
  });

  req.session.flash = 'Record updated successfully.';
  res.redirect('/dashboard');
};

// POST /records/:id/delete
exports.deleteRecord = (req, res) => {
  const { id } = req.params;
  const userId = req.session.user.id;

  const deleted = recordModel.deleteRecord(id, userId);
  if (!deleted) {
    return res.status(404).send('Record not found');
  }

  req.session.flash = 'Record deleted successfully.';
  res.redirect('/dashboard');
};
