import { app } from "./src/app.ts";
import { router } from "./src/routers/index.router.ts";

const PORT = process.env.PORT || 3500;

// Démarre un serveur
app.listen(PORT, () => {
  console.info(`🚀 File upload service started at http://localhost:${PORT}`);
});
