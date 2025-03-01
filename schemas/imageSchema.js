const { Schema, model } = require("mongoose");

const imageSchema = new Schema({
  author: {
    type: String,
    required: [true, "Author is required"],
  },
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  imageURL: {
    type: String,
    required: [true, "Image URL is required"],
  },
  visibility: {
    type: String,
    required: [true, "Image URL is required"],
    enum: ["public", "private"],
  },
  totalAccess: {
    type: Number,
    default: 0,
  },
});

const Image = model("Image", imageSchema);

module.exports = Image;
