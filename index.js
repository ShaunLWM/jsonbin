const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const uuid = require("uuid/v4");

const config = require("./config");
const Database = require("./modules/connector/redis");
const routes_create = require("./routes/create");
const routes_read = require("./routes/read");
const routes_delete = require("./routes/delete");

let app = express();
let database = new Database();

app.enable("trust proxy");
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

app.get("/genid", (req, res) => {
    return res.status(200).json({ _success: true, id: uuid() })
});

app.use(routes_create);
app.use(routes_read);
app.use(routes_delete);

app.use((err, req, res, next) => {
    console.error(err);
    return res.status(err.statusCode || 500).json({ _success: false, _message: err.message });
});

app.database = database;
app.listen(config.serverPort, err => {
    if (err) return console.error(err);
    console.log("[@] server started on port 5000");
});