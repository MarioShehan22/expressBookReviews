const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
//const axios = require('axios');

public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if username already exists
  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add new user
  users.push({ username: username, password: password });
  res.status(200).json({ message: "Customer successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  res.status(200).send(JSON.stringify({ books }, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.send(JSON.stringify(book, null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;
  const out = [];

  Object.keys(books).forEach(isbn => {
    if (books[isbn].author === author) {
      out.push({ isbn, title: books[isbn].title, reviews: books[isbn].reviews });
    }
  });

  return out.length
    ? res.send(JSON.stringify({ booksbyauthor: out }, null, 4))
    : res.status(404).json({ message: "No books found for the given author" });
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  const out = [];

  Object.keys(books).forEach(isbn => {
    if (books[isbn].title === title) {
      out.push({ isbn, author: books[isbn].author, reviews: books[isbn].reviews });
    }
  });

  return out.length
    ? res.send(JSON.stringify({ booksbytitle: out }, null, 4))
    : res.status(404).json({ message: "No books found with the given title" });
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    res.send(JSON.stringify(book.reviews, null, 4));
  } else if (book) {
    res.send(JSON.stringify({}, null, 4));
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});


// -----------------------------
// Async/Await with Axios (Tasks 10–13)
// -----------------------------

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const data = await promiseCb((resolve) => {
      const booksList = Object.values(books);
      resolve(booksList);
    }, 3000);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

// TASK 10 – Get the book list available in the shop using Promises
public_users.get('/books', function (req, res) {
  const get_books = new Promise((resolve, reject) => {
    resolve(res.send(JSON.stringify({ books }, null, 4)));
  });

  get_books.then(() => console.log("Promise for Task 10 resolved"));
});

// TASK 11 – Get book details based on ISBN using Promises
public_users.get('/books/isbn/:isbn', function (req, res) {
  const get_books_isbn = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    if (req.params.isbn <= 10) {
      resolve(res.send(books[isbn]));
    } else {
      reject(res.send('ISBN not found'));
    }
  });

  get_books_isbn
    .then(function () {
      console.log("Promise for Task 11 is resolved");
    })
    .catch(function () {
      console.log('ISBN not found');
    });
});

// TASK 12 – Get book details based on author using Promises
public_users.get('/books/author/:author', function (req, res) {
  const get_books_author = new Promise((resolve, reject) => {
    let booksbyauthor = [];
    let isbns = Object.keys(books);

    isbns.forEach((isbn) => {
      if (books[isbn]["author"] === req.params.author) {
        booksbyauthor.push({
          "isbn": isbn,
          "title": books[isbn]["title"],
          "reviews": books[isbn]["reviews"]
        });
      }
    });

    if (booksbyauthor.length) {
      resolve(res.send(JSON.stringify({ booksbyauthor }, null, 4)));
    } else {
      reject(res.send("The mentioned author does not exist "));
    }
  });

  get_books_author
    .then(function () {
      console.log("Promise is resolved");
    })
    .catch(function () {
      console.log('The mentioned author does not exist');
    });
});

// TASK 13 – Get all books based on title using Promises
public_users.get('/books/title/:title', function (req, res) {
  const get_books_title = new Promise((resolve, reject) => {
    let booksbytitle = [];
    let isbns = Object.keys(books);

    isbns.forEach((isbn) => {
      if (books[isbn]["title"] === req.params.title) {
        booksbytitle.push({
          "isbn": isbn,
          "author": books[isbn]["author"],
          "reviews": books[isbn]["reviews"]
        });
      }
    });

    if (booksbytitle.length) {
      resolve(res.send(JSON.stringify({ booksbytitle }, null, 4)));
    } else {
      reject(res.send("The mentioned title does not exist "));
    }
  });

  get_books_title
    .then(function () {
      console.log("Promise is resolved");
    })
    .catch(function () {
      console.log('The mentioned book title doesnt exist');
    });
});

module.exports.general = public_users;
