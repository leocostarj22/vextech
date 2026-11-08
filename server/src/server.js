import "dotenv/config";
import { app } from "./app.js";

const porta = process.env.PORT || 3001;
app.listen(porta, () => {
  console.log(`API da Vextech em http://localhost:${porta}`);
});
