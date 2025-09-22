const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

// Shared users store (registration code in general.js pushes into this)
let users = [];

// Basic username validator
const isValid = (username) => {
  return typeof username === 'string' && username.trim().length > 0;
};

// Check username/password pair
const authenticatedUser = (username, password) => {
  return users.some(u => u.username === username && u.password === password);
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate inputs
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  // Verify credentials
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login. Check username and password." });
  }

  // Create JWT (1h expiry is common for demos)
  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

  // Save to session for subsequent /customer/auth/* routes
  req.session.authorization = { accessToken, username };

   return res.status(200).send("Customer successfully logged in");
});
// Add or modify a book review (Task 8)
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
  
    // review must come as a *query* param per assignment hint
    const review = req.query.review;
  
    // must be logged in; username saved in session by /login
    if (!req.session || !req.session.authorization || !req.session.authorization.username) {
      return res.status(401).json({ message: "Unauthorized: please log in first" });
    }
    const username = req.session.authorization.username;
  
    if (!review || !review.trim()) {
      return res.status(400).json({ message: "Missing review. Provide it as a query param ?review=..." });
    }
  
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Ensure reviews container exists
    if (!book.reviews) book.reviews = {};
  
    const isUpdate = Object.prototype.hasOwnProperty.call(book.reviews, username);
    book.reviews[username] = review.trim();
  
    return res.status(200).send(`The review for the book with ISBN ${req.params.isbn} has been added/updated.`);
  });
  
  // Delete a book review by the logged-in user (Task 9)
 regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
  
    if (!req.session || !req.session.authorization || !req.session.authorization.username) {
      return res.status(401).json({ message: "Unauthorized: please log in first" });
    }
    const username = req.session.authorization.username;
  
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (!book.reviews || !book.reviews[username]) {
      return res.status(404).json({ message: "No review by this user for the specified ISBN" });
    }
  
    delete book.reviews[username];
  
    return res.status(200).send(`Reviews for the ISBN ${req.params.isbn} posted by the user ${req.session.authorization.username} deleted.`);
    
  });
  

// (You can implement review routes later)
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
