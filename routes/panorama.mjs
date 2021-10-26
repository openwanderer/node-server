import express from 'express';
const router = express.Router();
import db from '../db/index.mjs';

import PanoController from '../controllers/panorama.mjs';
const controller = new PanoController(db);

router.get('/:id(\\d+)', controller.findById.bind(controller));
router.get('/:id(\\d+).jpg', controller.getImage.bind(controller));
router.delete('/:id(\\d+)', controller.deletePano.bind(controller));
router.get('/nearest/:lon/:lat', controller.findNearest.bind(controller));
router.get('/nearby/:lon/:lat/:limit', controller.findNearby.bind(controller));
router.get('/all', controller.findByBbox.bind(controller));
router.post('/:id(\\d+)/rotate', controller.rotate.bind(controller));
router.post('/:id(\\d+)/move', controller.move.bind(controller));
router.post('/moveMulti', controller.moveMulti.bind(controller));
router.post('/upload', controller.upload.bind(controller));
router.get('/unpositioned', controller.findUnpositioned.bind(controller));
router.get('/unauthorised', controller.findUnauthorised.bind(controller));
router.post('/sequence/create', controller.createSequence.bind(controller));
router.get('/sequence/:id', controller.getSequence.bind(controller));

export default router;
