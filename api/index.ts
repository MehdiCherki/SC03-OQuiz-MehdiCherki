import { config } from "./config.ts";
import { app } from "./src/app.ts";

// Démarre un serveur
app.listen(config.port, () => {
  console.info(`🚀 Server started at http://localhost:${config.port}`);
});
