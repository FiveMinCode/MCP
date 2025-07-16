const redis = require('./services/redisClient');

exports.getContext = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const raw = await redis.lrange(`ctx:${sessionId}`, 0, -1);
    const history = raw.map(item => JSON.parse(item));
    res.json({ sessionId, history });
  } catch (err) {
    next(err);
  }
};