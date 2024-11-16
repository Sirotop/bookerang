// Initialize IndexedDB
let db;
const request = indexedDB.open("BookerangDB", 1);

request.onerror = (event) => {
    console.error("Database error:", event.target.error);
};

request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("books")) {
        db.createObjectStore("books", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadBooks();
};

// UI Functions
function showAddForm() {
    const form = document.getElementById('addForm');
    const dateInput = document.getElementById('loanDate');
    dateInput.value = new Date().toISOString().split('T')[0];
    form.classList.add('visible');
}

function hideAddForm() {
    document.getElementById('addForm').classList.remove('visible');
    document.getElementById('addForm').reset();
}

function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

async function addBook(event) {
    event.preventDefault();

    const book = {
        title: document.getElementById('title').value,
        borrower: document.getElementById('borrower').value,
        loanDate: document.getElementById('loanDate').value,
        returned: false,
        createdAt: new Date().toISOString()
    };

    const transaction = db.transaction(["books"], "readwrite");
    const store = transaction.objectStore("books");

    store.add(book);

    transaction.oncomplete = () => {
        hideAddForm();
        loadBooks();
    };
}

function loadBooks() {
    const bookList = document.getElementById('bookList');

    const transaction = db.transaction(["books"], "readonly");
    const store = transaction.objectStore("books");
    const request = store.getAll();

    request.onsuccess = () => {
        const books = request.result;

        if (books.length === 0) {
            bookList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #B85042; opacity: 0.7;">No books added yet</p>';
            return;
        }

        bookList.innerHTML = books.map(book => `
      <div class="book-card ${book.returned ? 'returned' : ''}" data-id="${book.id}">
        <button
          class="return-button"
          onclick="toggleReturn(${book.id})"
          title="${book.returned ? 'Mark as not returned' : 'Mark as returned'}"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
        <div class="book-content">
          <h2 class="book-title">${book.title}</h2>
          <div class="book-details">
            <span>Borrowed by: ${book.borrower}</span>
            <span>${formatDateForDisplay(book.loanDate)}</span>
          </div>
        </div>
      </div>
    `).join('');
    };
}

function toggleReturn(bookId) {
    const transaction = db.transaction(["books"], "readwrite");
    const store = transaction.objectStore("books");

    const getRequest = store.get(bookId);

    getRequest.onsuccess = () => {
        const book = getRequest.result;

        // Delete the book from storage instead of marking it returned
        const deleteRequest = store.delete(bookId);

        // Animate the card
        const card = document.querySelector(`.book-card[data-id="${bookId}"]`);
        card.classList.add('slide-out');

        // Remove the card after animation
        setTimeout(() => {
            card.remove();
            // Check if there are any books left
            const remainingBooks = document.querySelectorAll('.book-card');
            if (remainingBooks.length === 0) {
                const bookList = document.getElementById('bookList');
                bookList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #B85042; opacity: 0.7;">No books added yet</p>';
            }
        }, 300);
    };
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('addForm').addEventListener('submit', addBook);
});

// Export functionality
async function exportData() {
    const transaction = db.transaction(["books"], "readonly");
    const store = transaction.objectStore("books");
    const request = store.getAll();

    request.onsuccess = async () => {
        const books = request.result;
        const exportData = JSON.stringify(books, null, 2);
        const fileName = `bookerang_${new Date().toISOString().split('T')[0]}.json`;

        if (navigator.share) {
            const file = new File([exportData], fileName, {
                type: 'application/json'
            });

            try {
                await navigator.share({
                    files: [file],
                    title: 'Export Bookerang Data',
                    text: 'My Bookerang book lending data'
                });
            } catch (err) {
                downloadFile(exportData, fileName);
            }
        } else {
            downloadFile(exportData, fileName);
        }
    };
}

function downloadFile(content, fileName) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function showImportDialog() {
    const modal = document.createElement('div');
    modal.innerHTML = `
    <div id="importModal" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    ">
      <div style="
        background: white;
        padding: 1.5rem;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      ">
        <h2 style="margin-bottom: 1rem; color: #B85042;">Import Books</h2>
        <textarea id="importData" style="
          width: 100%;
          height: 200px;
          padding: 0.75rem;
          border: 1px solid rgba(62, 86, 75, 0.2);
          border-radius: 8px;
          margin-bottom: 1rem;
          font-family: monospace;
          resize: vertical;
        " placeholder="Paste your Bookerang JSON data here..."></textarea>
        <div style="display: flex; gap: 1rem;">
          <button onclick="closeImportDialog()" style="
            flex: 1;
            padding: 0.875rem;
            border: none;
            border-radius: 8px;
            background: rgba(62, 86, 75, 0.1);
            color: #B85042;
            font-weight: 600;
            cursor: pointer;
          ">Cancel</button>
          <button onclick="importData()" style="
            flex: 1;
            padding: 0.875rem;
            border: none;
            border-radius: 8px;
            background: #B85042;
            color: #E7E8D1;
            font-weight: 600;
            cursor: pointer;
          ">Import</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(modal);
}

function closeImportDialog() {
    const modal = document.getElementById('importModal').parentElement;
    document.body.removeChild(modal);
}

async function importData() {
    const importText = document.getElementById('importData').value;

    try {
        const books = JSON.parse(importText);

        if (!Array.isArray(books)) {
            throw new Error('Invalid data format');
        }

        const transaction = db.transaction(["books"], "readwrite");
        const store = transaction.objectStore("books");

        const promises = books.map(book => {
            const { id, ...bookData } = book;
            return new Promise((resolve, reject) => {
                const request = store.add(bookData);
                request.onsuccess = () => resolve();
                request.onerror = () => reject();
            });
        });

        await Promise.all(promises);
        closeImportDialog();
        loadBooks();
        alert('Books imported successfully!');
    } catch (error) {
        alert('Error importing data. Please check the format and try again.');
    }
}
