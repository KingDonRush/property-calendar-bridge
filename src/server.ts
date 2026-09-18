import "dotenv/config";
import { createHttpServer } from "./httpServer.js";

const port = Number(process.env.PORT ?? 3000);
const server = createHttpServer();

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
