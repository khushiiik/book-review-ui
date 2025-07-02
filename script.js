const API_BASE = "https://book-review-api-xch1.onrender.com";

const bookForm = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");
const searchInput = document.getElementById("searchInput");
const toast = document.getElementById("toast");

window.onload = fetchBooks;

bookForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const published_year = document.getElementById("year").value;
  const submitBtn = bookForm.querySelector("button");

  if (!title || !author) {
    showToast("Please enter both title and author.", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Adding...";

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
      showToast("✅ Book added!");
      bookForm.reset();
      document.getElementById("title").focus();

      // ✅ Add slight delay to let backend catch up
      setTimeout(() => {
        fetchBooks(); // Refresh list
      }, 500); // 500ms delay
    } else {
      showToast(data.error || "Something went wrong", "error");
    }
  } catch (error) {
    showToast("Failed to add book: " + error.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Add Book";
  }
});


async function fetchBooks() {
  try {
    const res = await fetch(`${API_BASE}/books`);
    const books = await res.json();

    console.log("Fetched books:", books); // for debugging

    bookList.innerHTML = ""; // Clear old list

    books.reverse().forEach((book) => {
      const li = document.createElement("li");
      li.className = "p-3 border rounded bg-gray-50 shadow";
      li.innerHTML = `<strong>${book.title}</strong> by ${book.author} (${book.published_year || "N/A"})`;
      bookList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    bookList.innerHTML = `<li class="text-red-600">Failed to load books</li>`;
  }
}


function showToast(message, type = "success") {
  toast.textContent = message;
  toast.className =
    "fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300 " +
    (type === "error" ? "bg-red-600" : "bg-green-600") +
    " text-white";
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}
