import { createHttpServer } from "./httpServer";

const port = Number(process.env.PORT ?? 3000);
const server = createHttpServer();

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
