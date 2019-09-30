const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const uuid = require("uuid/v4");

const Database = require("./modules/connector/redis");
const routes_add = require("./routes/create");

let app = express();
let database = new Database();

app.enable("trust proxy");
app.use(helmet());
app.use(cors());
app.use(express.static(path.join(__dirname, "wwww")));
app.use(bodyParser.json());

app.get("/genid", (req, res) => {
    return res.status(200).json({ _success: true, id: uuid() })
});

app.use(routes_add);
app.use((err, req, res, next) => {
    console.error(err);
    return res.status(err.statusCode || 500).json({ _success: false, _message: err.message });
});

app.database = database;
app.listen(5000, err => {
    if (err) return console.error(err);
    console.log("[@] server started on port 5000");
});