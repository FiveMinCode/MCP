const express = require('express');
const { getContext } = require('../contextController');
const { postConversation } = require('../conversationController');

const router = express.Router();

router.get('/context/:sessionId', getContext);
router.post('/conversation', postConversation);

module.exports = router;