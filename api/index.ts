import { config } from "./config.ts";
import { app } from "./src/app.ts";

// Démarre un serveur
app.listen(config.port, () => {
  console.info(`🚀 Server started at http://localhost:${config.port}`);
  // logger.info("Server started", { additionalData: "je suis un test" });
  // try {
  //   throw new Error("this is an error");
  // } catch (err) {
  //   if (err instanceof Error) {
  //     logger.error("a test error has occured", { error: err.message });
  //   }
  // }
});
