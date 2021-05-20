const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
		let results = await db.all();
		res.json({
			status: 'SUCCESS',
			data: results
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error });
	}
});

module.exports = router;
