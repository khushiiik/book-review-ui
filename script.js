const API_BASE = "https://book-review-api-xch1.onrender.com";

const bookForm = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");
const searchInput = document.getElementById("searchInput");
const toast = document.getElementById("toast");

window.onload = fetchBooks;

bookForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");
  const yearInput = document.getElementById("year");

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const published_year = yearInput.value.trim();
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
      bookForm.reset(); // Clear form
      titleInput.focus(); // Focus again

      await new Promise((resolve) => setTimeout(resolve, 600)); // Wait for Render backend to catch up
      await fetchBooks(); // Reload list

      // Scroll to top so user sees the new book
      window.scrollTo({ top: 0, behavior: "smooth" });
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

    console.log("Fetched books:", books);

    bookList.innerHTML = "";

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

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const items = Array.from(bookList.children);

  const matching = [];
  const nonMatching = [];

  items.forEach((item) => {
    const text = item.textContent.toLowerCase();
    if (text.includes(keyword)) {
      matching.push(item);
      item.style.display = "block";
    } else {
      nonMatching.push(item);
      item.style.display = "none";
    }
  });

  // Reorder DOM: matched books on top
  bookList.innerHTML = "";
  matching.forEach((item) => bookList.appendChild(item));
  nonMatching.forEach((item) => bookList.appendChild(item));
});

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
