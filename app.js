const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose
  .connect("mongodb://localhost:27017/wikiDB")
  .then(() => console.log("connected successfully to MongoDB via Mongoose"))
  .catch((err) => console.error(err));

// Define the schema; validator put in rating
const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
});

// Create the model
const Article = mongoose.model("Article", articleSchema);

// using app.route for ALL articles GET, POST, DELETE route
app
  .route("/articles")
  .get(async (req, res) => {
    // READ: Find all documents
    const foundArticles = await Article.find({});
    console.log(foundArticles);
    try {
      res.send(foundArticles);
    } catch (err) {
      console.error("error:", err);
      res.status(500).send("Error loading homepage.");
    }
  })
  .post(async (req, res) => {
    // to grab data sent through
    //   console.log(rboc, rbot);
    try {
      const newArticle = new Article({
        title: req.body.title,
        content: req.body.content,
      });
      // await must be outside the object, after it's been created.
      await newArticle.save();
      res.send("Successfully added a new article");
      console.log("Successfully added a new article");
    } catch (err) {
      res.send(err);
    }
  })
  .delete(async (req, res) => {
    try {
      await Article.deleteMany();
      res.send("successfully deleted all articles.");
      // res.redirect("/");
    } catch (err) {
      res.send(err);
    }
  });

// using app.route for ONE article GET, POST, DELETE route
app
  .route("/articles/:articleTitle")
  .get(async (req, res) => {
    // READ: Find all documents
    try {
      const customListName = req.params.articleTitle;
      const foundArticle = await Article.findOne({ title: customListName });
      if (foundArticle) {
        // node only uses first argument so using template literals
        res.send(`match found: ${foundArticle}`);
      } else {
        res.send("match not found!");
      }
    } catch (err) {
      res.send(err);
    }
  })
  .put(async (req, res) => {
    try {
      const title = req.body.title;
      const content = req.body.content;

      // Validate input: to prevent broken request or return {} in pman
      if (!title || !content) {
        return res.status(400).send("Both title and content are required.");
      }
      const newArticle = await Article.replaceOne(
        { title: req.params.articleTitle },
        { title, content }
      );
      if (newArticle.matchedCount > 0) {
        // to avoid this: successfully replaced the article: [object Object] used stringify
        res.send(
          `Successfully replaced the article: ${JSON.stringify(newArticle)}`
        );
        console.log("Successfully replaced the article.");
      } else {
        res.status(404).send("Article not found.");
      }
    } catch (err) {
      res.send(err);
    }
  })

  // to update specific field in specific document
  .patch(async (req, res) => {
    try {
      const title = req.body.title;
      const content = req.body.content;

      const newArticle = await Article.updateOne(
        { title: req.params.articleTitle },
        { title, content }
      );
      if (newArticle.matchedCount > 0) {
        // to avoid this: successfully replaced the article: [object Object] used stringify
        res.send(
          `Successfully replaced the article: ${JSON.stringify(newArticle)}`
        );
        console.log("Successfully replaced the article.");
      } else {
        res.status(404).send("Article not found.");
      }
    } catch (err) {
      res.send(err);
    }
  })

  .delete(async (req, res) => {
    try {
      // deleteOne takes only 1 param
      const result = await Article.deleteOne({
        title: req.params.articleTitle,
      });
      if (result.deletedCount > 0) {
        // to avoid this: successfully deleted the article: [object Object] use stringify
        res.send(`Successfully deleted the article: ${JSON.stringify(result)}`);
        console.log("Successfully deleted the article.");
      } else {
        res.status(404).send("Article not found.");
      }
    } catch (err) {
      res.send(err);
    }
  });

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
