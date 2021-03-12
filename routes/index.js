const express = require('express');
const router = express.Router();
const { checkedAuth, straightAuth } = require('../config/auth');
const { PythonShell } = require('python-shell');
router.get('/', straightAuth, (req, res) => res.render('firstPage'));

router.get('/PersonalArea', checkedAuth, (req, res) =>
  res.render('PersonalArea', {
    user: req.user
  })
);

router.get('/parse', (req, res)=>{
  console.log(123);
  PythonShell.run('parse/parser.py', null, function (err) {
    if (err) throw err;
    console.log('finished');
  });
});

module.exports = router;
