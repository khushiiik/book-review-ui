const API_BASE = "https://book-review-api-xch1.onrender.com"; // your live API

const bookForm = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");

// Fetch and display all books on page load
window.onload = fetchBooks;

// Handle form submission to add a new book
bookForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // prevent page reload

  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const published_year = document.getElementById("year").value;

  if (!title || !author) {
    alert("Title and author are required!");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, author, published_year }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Book added successfully!");
      bookForm.reset();
      fetchBooks(); // refresh the list
    } else {
      alert(data.error || "Something went wrong");
    }
  } catch (error) {
    alert("Failed to add book: " + error);
  }
});

// Fetch books from the API
async function fetchBooks() {
  try {
    const res = await fetch(`${API_BASE}/books`);
    const books = await res.json();

    bookList.innerHTML = ""; // clear old list

    books.forEach((book) => {
      const li = document.createElement("li");
      li.className = "p-3 border rounded bg-gray-50 shadow";
      li.innerHTML = `
        <strong>${book.title}</strong> by ${book.author} (${book.published_year || "N/A"})
      `;
      bookList.appendChild(li);
    });
  } catch (error) {
    bookList.innerHTML = `<li class="text-red-600">Failed to load books</li>`;
  }
}
