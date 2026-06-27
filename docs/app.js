let books = [];

fetch('http://localhost:3000/api/books')
    .then(res => res.json())
    .then(data => {
        books = data;
        renderBooks();
        renderTodayTasks();
    })

const todayStr = new Date().toLocaleDateString();
const completedToday = JSON.parse(localStorage.getItem('completedToday') || '{}');

// 日付が変わったらリセット
if (completedToday.date !== todayStr) {
    localStorage.setItem('completedToday', JSON.stringify({ date: todayStr, indexes: [] }));
}
const clearBtn = document.querySelector('#clearBtn');
const homeBtn = document.querySelector('#homeBtn');
const addBtn = document.querySelector('#addBtn');
const listBtn = document.querySelector('#listBtn');

const homePage = document.querySelector('#homePage');
const addPage = document.querySelector('#addPage');
const listPage = document.querySelector('#listPage');

const tabs = document.querySelectorAll('.tab');

const taskContainer = document.querySelector('#taskContainer');
//タブ切り替え
function showPage(page) {
    homePage.classList.add('hidden');
    addPage.classList.add('hidden');
    listPage.classList.add('hidden');

    page.classList.remove('hidden');
}

//active切り替え
function activeTab(button) {

    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    button.classList.add('active');
}

//ホーム
homeBtn.addEventListener('click', () => {
    showPage(homePage);
    activeTab(homeBtn);
})

//教材追加
addBtn.addEventListener('click', () => {
    showPage(addPage);
    activeTab(addBtn);
})

//一覧

listBtn.addEventListener('click', () => {
    showPage(listPage);
    activeTab(listBtn);
})


const bookForm = document.querySelector('#bookForm');

const titleInput = document.querySelector('#title');
const totalPagesInput = document.querySelector('#totalPages');
const currentPageInput = document.querySelector('#currentPage');
const deadlineInput = document.querySelector('#deadline');

const bookList = document.querySelector('#bookList');

//保存用配列



//フォーム送信イベント

bookForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const book = {
        title: titleInput.value,
        totalPages: Number(totalPagesInput.value),
        currentPage: Number(currentPageInput.value),
        deadline: deadlineInput.value
    };

    fetch('http://localhost:3000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book)
    })
        .then(res => res.json())
        .then(newBook => {
            books.push(newBook);
            renderBooks();
            renderTodayTasks();
            bookForm.reset();
        });
})
//一覧表示機能

function renderBooks() {
    bookList.innerHTML = '';

    books.forEach((book, index) => {

        const div = document.createElement('div');
        const percent = Math.round((book.currentPage / book.totalPages) * 100);

        div.innerHTML = `
            <div class="book-card">
                <div class="book-info">
                    <div class="book-title">${book.title}</div>
                    <div class="book-progress">${book.currentPage} / ${book.totalPages}ページ　${percent}%</div>
                    <div class="progress-bar" style = "margin-top:8px;">
                    <div class= "progress-fill" style="width: ${percent}% ">
                    </div>
                </div>    
                </div>
                
                 <div class="book-right">
                    <div class="book-deadline">期限: ${book.deadline}</div>
                    <button class="deleteBtn delete-btn">削除</button>
                </div>
            </div>
        `;

        const deleteBtn = div.querySelector('.deleteBtn');

        deleteBtn.addEventListener('click', () => {
            fetch(`http://localhost:3000/api/books/${book.id}`, {
                method: 'DELETE'
            })
                .then(() => {
                    books.splice(index, 1);
                    renderBooks();
                    renderTodayTasks();
                });
        });

        bookList.append(div);

    });
}



function renderTodayTasks() {
    taskContainer.innerHTML = '';

    //教材がない場合(既存)
    if (books.length === 0) {
        taskContainer.innerHTML = '<p>教材を追加してください</p>';
        return;
    }
//完了済みデータを取得
    const completed = JSON.parse(localStorage.getItem('completedToday'));

    //全タスク完了チェック
    const allDone = books.every((_, index) =>
        completed.indexes.includes(index)
    );

    if (allDone) {
        taskContainer.innerHTML = '<P>🎊今日のタスク完了！</p>';
        return;
    }

    books.forEach((book, index) => {
        const completed = JSON.parse(localStorage.getItem('completedToday'));
        //完了済みは飛ばす

        if (completed.indexes.includes(index)) return;

        const today = new Date();
        const deadline = new Date(book.deadline);

        const diffTime = deadline - today;
        const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const remainingPages = book.totalPages - book.currentPage;
        const pagesPerDay = Math.ceil(remainingPages / remainingDays);

        const startPage = book.currentPage + 1;
        const endPage = Math.min(book.currentPage + pagesPerDay, book.totalPages);


        const div = document.createElement('div');

        //taskカードに変更
        const progressPercent = Math.round((book.currentPage / book.totalPages) * 100);
        const badgeClass = remainingDays <= 7 ? 'badge warn' : 'badge';

        div.innerHTML = `
            <div class="task-card">
                <div class="task-card-header">
                    <span class="task-title">${book.title}</span>
                    <span class="${badgeClass}">あと${remainingDays}日</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${progressPercent}%"></div>
                </div>
                <div class="task-meta">
                    <span class="task-range">今日: ${startPage}〜${endPage}ページ</span>
                    <button class='completeBtn complete-btn'>完了</button>
                </div>
            </div>`;
        const completeBtn = div.querySelector('.completeBtn');

        completeBtn.addEventListener('click', () => {
            //チェックオーバーレイを追加
            const overlay = document.createElement('div');
            overlay.className = 'check-overlay';
            overlay.textContent = '✅';
            div.querySelector('.task-card').appendChild(overlay);

            //少し待ってから処理
            setTimeout(() => {
              fetch(`http://localhost:3000/api/books/${book.id}`, {
                method: 'PUT',
                headers:  {'Content-Type': 'application/json' },
                body:  JSON.stringify({ currentPage: endPage })
              })
                  .then(res => res.json())
                  .then(updatedBook => {
                    books[index].currentPage = updatedBook.currentPage;
                  })

                //今日完了済みに追加
                const completed = JSON.parse(localStorage.getItem('completedToday'));
                completed.indexes.push(index);
                localStorage.setItem('completedToday', JSON.stringify(completed));

                renderBooks();
                renderTodayTasks();
            }, 600);

        })



        taskContainer.append(div);
    })
}



clearBtn.addEventListener('click', () => {

    const result = confirm('本当に全削除しますか？');

    if (result) {

        books = [];

        localStorage.removeItem('books');

        renderBooks();
        renderTodayTasks();

    }

});




