require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const mcpRoutes = require('./routes/mcpRoutes');

const app = express();
app.use(express.json());

app.use('/mcp', mcpRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`MCP server listening on http://localhost:${port}`));