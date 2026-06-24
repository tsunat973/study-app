const express = require('express');
const app = express();
const PORT = 3000;
app.use(express.json());

//　ダミーのタスクデータ
let books = [
    { id: 1, title: "英単語ターゲット", totalPages: 500, currentPage: 120, deadline: "2026-07-21"},
    { id: 2, title: "数学の問題集", totalPages: 300, currentPage: 50, deadline: "2026-07-15" },
];

app.get('/', (req, res) => {
    res.json({ message: 'Hello Express!' });
});

app.get('/api/books', (req, res) => {
    res.json(books);
});

app.get('/api/books/:id', (req, res) => {
    const task = books.find(t => t.id === Number(req.params.id));
    if (!task) {
        return res.status(404).json({ error: 'タスクが見つかりません' });
    }
    res.json(task);
});

app.post('/api/books', (req, res) => {
    const newbook = {
        id: books.length + 1,
        title: req.body.title,
        totalPages: req.body.totalPages,
        currentPage: req.body.currentPage,
        deadline: req.body.deadline
    };

    books.push(newbook);
    res.status(201).json(newbook);
});

app.put('/api/books/:id', (req, res) => {
    const book = books.find(t => t.id === Number(req.params.id));
    if (!book) {
        return res.status(404).json({ error: 'タスクが見つかりません' });
    }

    book.currentPage = req.body.currentPage;
    res.json(book);
});

app.delete('/api/books/:id', (req, res) => {
    const index = books.findIndex(t => t.id === Number(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'タスクが見つかりません' });
    }

    books.splice(index, 1);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT} `)
});