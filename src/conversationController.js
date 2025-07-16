const redis = require('./services/redisClient');
const llmClient = require('./services/llmClient');

exports.postConversation = async (req, res, next) => {
  try {
    const { sessionId, role, content } = req.body;

    // 1. Append user message
    await redis.rpush(`ctx:${sessionId}`, JSON.stringify({ role, content }));

    // 2. Fetch full history
    const raw = await redis.lrange(`ctx:${sessionId}`, 0, -1);
    const history = raw.map(item => JSON.parse(item));

    // 3. Generate assistant reply
    const replyText = await llmClient.generateReply(history);

    // 4. Store assistant message
    const assistantMsg = { role: 'assistant', content: replyText };
    await redis.rpush(`ctx:${sessionId}`, JSON.stringify(assistantMsg));

    // 5. Respond
    res.json({ reply: assistantMsg });
  } catch (err) {
    next(err);
  }
};