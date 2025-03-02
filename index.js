require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Image = require("./schemas/imageSchema");

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://link-sharing-system-client.web.app",
      "https://link-sharing-system-client.firebaseapp.com",
    ],
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

const responseErr = {
  acknowledgement: false,
  message: "Something went wrong!",
};

mongoose
  .connect(uri)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

const checkToken = (req, res, next) => {
  const token = req?.cookies?.LINK_SHARING_SYSTEM;

  if (!token) {
    return res.status(403).send({ message: "Unauthorized access" });
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "Unauthorized access" });
      }
      req.decodedEmail = decoded.email;
      next();
    });
  }
};

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

app.post("/upload-image", checkToken, async (req, res) => {
  const imageData = req.body;

  try {
    const newImage = new Image({ ...imageData });
    await newImage.save();

    res.send({ acknowledgement: true, message: "Image saved" });
  } catch (err) {
    res.send(responseErr);
  }
});

app.post("/my-links", checkToken, async (req, res) => {
  const { email } = req.decodedEmail;

  try {
    const myLinks = await Image.find({ author: email }).exec();
    res.send({ acknowledgement: true, myLinks });
  } catch (err) {
    res.send(responseErr);
  }
});

app.get("/all-links", async (req, res) => {
  const token = req?.cookies?.LINK_SHARING_SYSTEM;

  let email;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      email = null;
    } else {
      email = decoded.email;
    }
  });

  try {
    const result = await Image.find({}).exec();
    const allLinks = result.map((link) => {
      if (!email && link.visibility === "private") {
        link.imageURL = "www.fake-image.com";
      }
      return link;
    });

    res.send({ acknowledgement: true, allLinks });
  } catch {
    res.send(responseErr);
  }
});

app.post("/get-image", checkToken, async (req, res) => {
  const { id } = req.body;
  try {
    const image = await Image.findByIdAndUpdate(
      id,
      {
        $inc: { totalAccess: 1 },
      },
      { new: true }
    ).exec();
    res.send({ acknowledgement: true, image });
  } catch (err) {
    res.send(err);
  }
});

app.post("/fetch-image", checkToken, async (req, res) => {
  const { id } = req.body;
  try {
    const image = await Image.findById(id, "title visibility imageURL");
    res.send({ acknowledgement: true, image });
  } catch {
    res.send(responseErr);
  }
});

app.post("/update-info", checkToken, async (req, res) => {
  const newData = req.body;
  try {
    const { id, imageData } = newData;
    await Image.findByIdAndUpdate(id, { ...imageData }).exec();
    res.send({ acknowledgement: true, message: "Image info updated" });
  } catch {
    res.send(responseErr);
  }
});

app.delete("/delete-image", async (req, res) => {
  const { id } = req.query;
  try {
    await Image.findByIdAndDelete(id);
    res.send({ acknowledgement: true, message: "Image deleted successfully" });
  } catch {
    res.send(responseErr);
  }
});

app.get("/", (req, res) => {
  res.send(
    '<h1 style="color:green; text-align:center">Server is running...</h1>'
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
