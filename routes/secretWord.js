const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (!req.session.secretWord) {
    req.session.secretWord = "syzygy";
  }

  res.render("secretWord", { secretWord: req.session.secretWord });
});

router.post("/", (req, res) => {
  if (req.body.secretWord.toUpperCase()[0] == "P") {
    req.flash("error", "That word won't work!");
    req.flash("error", "You can't use words that start with p.");
  } else {
    req.session.secretWord = req.body.secretWord;
    req.flash("info", "The secret word was changed.");
  }

  res.redirect("/secretWord");
});

module.exports = router;