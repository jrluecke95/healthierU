const express = require('express');
const router = express.Router();
const db = require("../models");
const bcrypt = require('bcrypt');

//
router.get('/athlete/:id', (req, res) => {
  db.Client.findByPk(req.params.id)
  .then((result) => {
    res.json(result)
  })
})

module.exports = router;