// DOM Element References
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");
const statusText = document.getElementById("status");
const emptyState = document.getElementById("empty-state");
const categoryChips = document.querySelectorAll(".chip");

// Helper: Display shimmer skeleton placeholders during loading
function showSkeletons() {
  resultsContainer.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-card";
    resultsContainer.appendChild(skeleton);
  }
}

// Core Fetch Function handling all 4 UI states
async function executeSearch(query) {
  const trimmedQuery = query.trim();

  // Task: Ignore empty searches
  if (!trimmedQuery) return;

  // STATE 2: LOADING — Trigger skeleton cards and status message
  if (emptyState) emptyState.style.display = "none";
  statusText.className = "status-message loading";
  statusText.textContent = `Searching for "${trimmedQuery}"...`;
  showSkeletons();

  // Construct Wikimedia Commons API Endpoint
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query" +
    "&generator=search&gsrsearch=" + encodeURIComponent(trimmedQuery) +
    "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*";

  // STATE 4 (Part A): ERROR HANDLING — Wrap network operations in try...catch
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // STATE 4 (Part B): EMPTY STATE — Handle search queries returning 0 items
    if (!data.query || !data.query.pages) {
      resultsContainer.innerHTML = "";
      statusText.className = "status-message empty";
      statusText.textContent = `No results found for "${trimmedQuery}". Try another keyword.`;
      return;
    }

    const items = Object.values(data.query.pages);

    // STATE 3: RESULTS — Display success banner and result count
    statusText.className = "status-message success";
    statusText.textContent = `Showing ${items.length} results for "${trimmedQuery}"`;

    renderResults(items);

  } catch (error) {
    // STATE 4 (Part C): NETWORK/API ERROR STATE
    console.error("Fetch failure:", error);
    resultsContainer.innerHTML = "";
    statusText.className = "status-message error";
    statusText.textContent = "Something went wrong while fetching images. Please check your network and try again.";
  }
}

// Render Results into Responsive Grid
function renderResults(items) {
  resultsContainer.innerHTML = "";

  items.forEach((item) => {
    if (!item.imageinfo || !item.imageinfo[0]) return;

    const imgInfo = item.imageinfo[0];
    const thumbUrl = imgInfo.thumburl || imgInfo.url;
    const fullImageUrl = imgInfo.url;
    const title = item.title ? item.title.replace(/^File:/, "") : "Untitled Image";

    const card = document.createElement("article");
    card.className = "card fade-in";

    const link = document.createElement("a");
    link.href = fullImageUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const img = document.createElement("img");
    img.src = thumbUrl;
    img.alt = title;
    img.loading = "lazy";

    const caption = document.createElement("p");
    caption.className = "card-title";
    caption.textContent = title;

    link.appendChild(img);
    link.appendChild(caption);
    card.appendChild(link);
    resultsContainer.appendChild(card);
  });
}

// Event Listeners
searchForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Stop page reload
  executeSearch(searchInput.value);
});

categoryChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const term = chip.textContent;
    searchInput.value = term;
    executeSearch(term);
  });
});