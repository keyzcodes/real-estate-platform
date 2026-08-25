require("dotenv").config();

const app = require("./app");

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`Real Estate Platform API running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Failed to start the server:", error.message);
  process.exit(1);
});