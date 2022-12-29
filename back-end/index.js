const express = require('express');
const { sequelize } = require('./models');

const sellerProductRoutes = require('./routes/sellerProducts.js');

const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/", (req, res) => res.send("Welcome to the API!"));
app.use("/s/p", sellerProductRoutes);
app.all("*", (req, res) =>res.send("404"));

app.listen(PORT, async () =>{
    console.log(`Server running on port: http://localhost:${PORT}`);
    await sequelize.sync();
    console.log("DB connected");
});