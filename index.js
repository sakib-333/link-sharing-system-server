require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const db_username = process.env.db_username;
const db_password = process.env.db_password;

const uri = process.env.URI.replace("<db_username>", db_username).replace(
  "<db_password>",
  db_password
);

mongoose
  .connect(uri)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send(
    '<h1 style="color:green; text-align:center">Server is running...</h1>'
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
