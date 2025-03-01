require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
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

app.post("/jwt", (req, res) => {
  const email = req.body;
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.cookie("LINK_SHARING_SYSTEM", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  res.send({ acknowledgement: true, status: "cookie created" });
});

app.post("/logout", async (req, res) => {
  res.clearCookie("LINK_SHARING_SYSTEM", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  res.send({ acknowledgement: true, status: "cookie cleared" });
});

app.get("/", (req, res) => {
  res.send(
    '<h1 style="color:green; text-align:center">Server is running...</h1>'
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
