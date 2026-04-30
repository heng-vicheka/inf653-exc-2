const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');

router.get('/create', recordController.getCreateRecord);
router.post('/', recordController.postCreateRecord);

router.get('/:id/edit', recordController.getEditRecord);
router.post('/:id', recordController.postEditRecord);

router.post('/:id/delete', recordController.deleteRecord);

module.exports = router;
