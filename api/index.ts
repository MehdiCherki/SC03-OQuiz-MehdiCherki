import { config } from "./config.ts";
import { app } from "./src/app.ts";
import { logger } from "./src/lib/log.ts"


// Démarre un serveur
app.listen(config.port, () => {
  console.info(`🚀 Server started at http://localhost:${config.port}`);
  logger.info('Server  Started', { additonalData: "test" });
  try{
    throw new Error("error")
  } catch(err){
    logger.error('error')
  }
});
