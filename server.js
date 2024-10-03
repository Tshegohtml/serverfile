const { createServer } = require('http');
const express = require('express');
const app = express();


app.use(express.json());

const hostname = '127.0.0.1';
const port = 3000;


let books = [
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        publisher: "Charles Scribner's Sons",
        publishedDate: "1925-04-10",
        isbn: "9780743273565"
    }
];

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
    // Log request body to verify input
    console.log(req.body); 

    // Destructure fields from the request body
    const { title, author, publisher, publishedDate, isbn } = req.body;
    
    // Validation to ensure all fields are provided
    if (!title || !author || !publisher || !publishedDate || !isbn) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new book object
    const newBook = { title, author, publisher, publishedDate, isbn };
    
    // Add the new book to the list of books
    books.push(newBook);
    
    // Respond with the newly created book
    res.status(201).json(newBook);
});

// PUT: Update details of an existing book by ISBN
app.put('/books/:isbn', (req, res) => {
    const { title, author, publisher, publishedDate } = req.body;
    const book = books.find(b => b.isbn === req.params.isbn);

    if (book) {
        // Update the fields of the found book
        book.title = title || book.title;
        book.author = author || book.author;
        book.publisher = publisher || book.publisher;
        book.publishedDate = publishedDate || book.publishedDate;
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
