const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const uuid = require("uuid/v4");

const routes_add = require("./routes/create");
let app = express();

app.enable("trust proxy");
app.use(cors());
app.use(express.static(path.join(__dirname, "wwww")));
app.use(bodyParser.json());

app.use(routes_add);
app.get("/genid", (req, res) => {

})

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.message });
});

app.listen(5000, err => {
    if (err) return console.error(err);
    console.log("[@] server started on port 5000");
})