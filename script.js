const API_BASE = "https://book-review-api-xch1.onrender.com";

const bookForm = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");
const searchInput = document.getElementById("searchInput");
const toast = document.getElementById("toast");

window.onload = fetchBooks;

// Add Book
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author, published_year }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast("✅ Book added!");
      bookForm.reset();
      titleInput.focus();
      await new Promise((resolve) => setTimeout(resolve, 600));
      await fetchBooks();
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

// Fetch Books
async function fetchBooks() {
  try {
    const res = await fetch(`${API_BASE}/books`);
    const books = await res.json();

    bookList.innerHTML = "";

    books.reverse().forEach((book) => {
      const li = document.createElement("li");
      li.className = "p-4 border rounded bg-gray-50 shadow space-y-2";
      li.innerHTML = `
        <div>
          <strong>${book.title}</strong> by ${book.author} (${book.published_year || "N/A"})
          <button class="ml-4 text-sm text-blue-600 underline" onclick="toggleReviewSection(${book.id})">💬 View Reviews</button>
        </div>
        <div id="review-section-${book.id}" class="mt-3 space-y-3 hidden border-t pt-3"></div>
      `;
      bookList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    bookList.innerHTML = `<li class="text-red-600">Failed to load books</li>`;
  }
}

// Toggle Review Section
async function toggleReviewSection(bookId) {
  const section = document.getElementById(`review-section-${bookId}`);

  if (!section.classList.contains("hidden")) {
    section.classList.add("hidden");
    section.innerHTML = "";
    return;
  }

  section.classList.remove("hidden");
  section.innerHTML = "<p>Loading reviews...</p>";

  try {
    const res = await fetch(`${API_BASE}/books/${bookId}/reviews`);
    const data = await res.json();
    const reviews = data.reviews;

    let html = `
      <form onsubmit="submitReview(event, ${bookId})" class="space-y-2">
        <input required type="text" id="reviewer-${bookId}" placeholder="Your Name" class="w-full p-2 border rounded" />
        <textarea required id="content-${bookId}" placeholder="Write a review..." class="w-full p-2 border rounded"></textarea>
        <select required id="rating-${bookId}" class="w-full p-2 border rounded">
          <option value="" disabled selected>Select Rating</option>
          <option value="1">⭐ 1</option>
          <option value="2">⭐⭐ 2</option>
          <option value="3">⭐⭐⭐ 3</option>
          <option value="4">⭐⭐⭐⭐ 4</option>
          <option value="5">⭐⭐⭐⭐⭐ 5</option>
        </select>
        <button class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Submit Review</button>
      </form>
      <hr/>
      <div class="space-y-2" id="reviews-list-${bookId}">
        ${reviews.length === 0 ? "<p>No reviews yet.</p>" : ""}
        ${reviews.map(r => `
          <div class="bg-white border p-2 rounded relative">
            <strong>${r.reviewer_name}</strong>
            <p>${r.content}</p>
            <p>⭐ Rating: ${r.rating}</p>
            <div class="absolute top-2 right-2 space-x-2">
              <button onclick="deleteReview(${r.id}, ${bookId})">🗑️</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    section.innerHTML = html;
  } catch (err) {
    console.error("Error loading reviews:", err);
    section.innerHTML = `<p class="text-red-600">Failed to load reviews</p>`;
  }
}

// Submit Review
async function submitReview(e, bookId) {
  e.preventDefault();

  const name = document.getElementById(`reviewer-${bookId}`).value.trim();
  const content = document.getElementById(`content-${bookId}`).value.trim();
  const rating = parseInt(document.getElementById(`rating-${bookId}`).value);

  if (!name || !content || isNaN(rating)) {
    showToast("Please fill in all fields including rating.", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/books/${bookId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewer_name: name, content, rating })
    });

    if (res.ok) {
      showToast("✅ Review submitted!");
      toggleReviewSection(bookId); // hide
      toggleReviewSection(bookId); // reload
    } else {
      showToast("❌ Failed to submit review", "error");
    }
  } catch (err) {
    showToast("❌ Error submitting review", "error");
    console.error(err);
  }
}


// Delete Review
function deleteReview(reviewId, bookId) {
  if (!confirm("Are you sure you want to delete this review?")) return;

  fetch(`${API_BASE}/reviews/${reviewId}`, {
    method: "DELETE"
  })
    .then((res) => {
      if (res.ok) {
        showToast("🗑️ Review deleted");
        toggleReviewSection(bookId); // refresh
        toggleReviewSection(bookId);
      } else {
        showToast("❌ Failed to delete review", "error");
      }
    })
    .catch(() => {
      showToast("❌ Error deleting review", "error");
    });
}

// Search Books
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

  bookList.innerHTML = "";
  matching.forEach((item) => bookList.appendChild(item));
  nonMatching.forEach((item) => bookList.appendChild(item));
});

// Toast Feedback
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
