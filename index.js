const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever Running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(`DB Error: ${err.massage}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// Get Books API
app.get("/books", async (req, res) => {
  const getBooksQuery = `
    SELECT
      *
    From
      book
    ORDER BY
      book_id;`;

  const bookArray = await db.all(getBooksQuery);
  res.send(bookArray);
});

// Get Book API
app.get("/books/:bookId/", async (req, res) => {
  const { bookId } = req.params;
  const getBookQuery = `SELECT * FROM book WHERE book_Id = ${bookId};`;
  const book = await db.get(getBookQuery);
  res.send(book);
});

// Add Book API
app.post("/books/", async (req, res) => {
  const bookDetails = req.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;

  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  res.send({ bookId: bookId });
});

// Update Book API
app.put("/books/:bookId/", async (req, res) => {
  const { bookId } = req.params;
  const bookDetails = req.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const updateBookQuery = `
  UPDATE 
    book
  SET
    title = '${title}',
    author_id = ${authorId},
    rating = ${rating},
    rating_count = ${ratingCount},
    review_count = ${reviewCount},
    description = '${description}',
    pages = ${pages},
    date_of_publication = '${dateOfPublication}',
    edition_language = '${editionLanguage}',
    price = ${price},
    online_stores = '${onlineStores}'
  WHERE
  book_Id = ${bookId};`;
  await db.run(updateBookQuery);
  res.send("Book Updated Successfully");
});

// Delete Book API
app.delete("/books/:bookId/", async (req, res) => {
  const { bookId } = req.params;
  const deleteBookQuery = `
    DELETE FROM
        book
    WHERE
        book_id = ${bookId};`;
  await db.run(deleteBookQuery);
  res.send("Book Deleted Successfully");
});

// Get Author Books
app.get("/authors/:authorId/books", async (req, res) => {
  const { authorId } = req.params;
  const getAuthorBookQuery = `
    SELECT
        *
    FROM
        book
    WHERE
        author_id = ${authorId};    
    `;
  const booksArray = await db.all(getAuthorBookQuery);
  res.send(booksArray);
});
