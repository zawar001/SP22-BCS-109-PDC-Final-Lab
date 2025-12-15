const express = require("express");
const cors = require("cors");
const { createExpressMiddleware } = require("@trpc/server/adapters/express");
const { appRouter } = require("./router");

const app = express();
const PORT = 8001;

app.use(cors());
app.use(express.json());

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req, res }) => ({ req, res }),
  })
);

app.listen(PORT, () => {
  console.log(`tRPC server running on http://127.0.0.1:${PORT}`);
});
