import express from "express";
import bodyParser from "body-parser";

import sellerProductRoutes from "./routes/sellerProducts.js";

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

app.get("/", (req, res) => res.send("Welcome to the API!"));
app.use("/s/p", sellerProductRoutes);
app.all("*", (req, res) =>res.send("404"));

app.listen(PORT, () =>console.log(`Server running on port: http://localhost:${PORT}`));