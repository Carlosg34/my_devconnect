const express = require('express');
const router = express.Router();

//Route Get api/profile/test
//Desc Test profile route
// Access public
router.get('/test', (req, res) => res.json({
    msg: "Profile Works"
}));

module.exports = router