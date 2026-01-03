const express = require('express');
const { getChatResponse } = require('../controllers/aiController');

const router = express.Router();

// POST /chat -> Generate a chat response from Gemini
router.post('/chat', getChatResponse);

module.exports = router;
