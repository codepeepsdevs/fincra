// Health check endpoint implementation
// Add this to your main server file (e.g., app.js, server.js, or index.js)

// For Express.js
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// For Fastify
// app.get('/api/health', async (request, reply) => {
//   return {
//     status: 'healthy',
//     timestamp: new Date().toISOString(),
//     uptime: process.uptime(),
//     environment: process.env.NODE_ENV || 'development'
//   };
// });

// For Koa
// app.use(async (ctx) => {
//   if (ctx.path === '/api/health') {
//     ctx.body = {
//       status: 'healthy',
//       timestamp: new Date().toISOString(),
//       uptime: process.uptime(),
//       environment: process.env.NODE_ENV || 'development'
//     };
//   }
// });
