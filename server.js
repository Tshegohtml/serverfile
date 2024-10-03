const { createServer } = require('http');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

const hostname = '127.0.0.1';
const port = 3000;

// File path to store books data
const dataFilePath = path.join(__dirname, 'books.json');

// Function to read the books data from file
function readBooksFromFile() {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath, 'utf-8');
        return JSON.parse(data);
    }
    return [];
}

// Function to write the books data to file
function writeBooksToFile(books) {
    fs.writeFileSync(dataFilePath, JSON.stringify(books, null, 2));
}

// Load books data on server start
let books = readBooksFromFile();

// GET: Retrieve all books
app.get('/books', (req, res) => {
    res.json(books);
});

// GET: Retrieve a specific book by ISBN
app.get('/books/:isbn', (req, res) => {
    const book = books.find(b => b.isbn === req.params.isbn);
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

// POST: Add a new book to the directory
app.post('/books', (req, res) => {
    const { title, author, publisher, publishedDate, isbn } = req.body;

    // Validation to ensure all fields are provided
    if (!title || !author || !publisher || !publishedDate || !isbn) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const newBook = { title, author, publisher, publishedDate, isbn };
    books.push(newBook);
    
    // Write updated books data to the file
    writeBooksToFile(books);

    res.status(201).json(newBook);
});

// PUT: Update details of an existing book by ISBN
app.put('/books/:isbn', (req, res) => {
    const { title, author, publisher, publishedDate } = req.body;
    const book = books.find(b => b.isbn === req.params.isbn);

    if (book) {
        book.title = title || book.title;
        book.author = author || book.author;
        book.publisher = publisher || book.publisher;
        book.publishedDate = publishedDate || book.publishedDate;

        // Write updated books data to the file
        writeBooksToFile(books);

        res.json(book);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

// DELETE: Remove a book by ISBN
app.delete('/books/:isbn', (req, res) => {
    const bookIndex = books.findIndex(b => b.isbn === req.params.isbn);
    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);

        // Write updated books data to the file
        writeBooksToFile(books);

        res.status(204).end();
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

// Error Handling: Handle 404 for unknown routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Create the server
const server = createServer(app);

// Start the server
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/books`);
});
