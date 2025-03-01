require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send(
    '<h1 style="color:green; text-align:center">Server is running...</h1>'
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
