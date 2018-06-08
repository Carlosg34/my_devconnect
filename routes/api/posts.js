const express = require('express');
const router = express.Router();

//Route Get api/posts/test
//Desc Test post route
// Access public
router.get('/test', (req, res) => res.json({
    msg: "Posts Work"
}));

module.exports = router