// DOM Element References
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("results");
const statusText = document.getElementById("status");
const emptyState = document.getElementById("empty-state");
const categoryChips = document.querySelectorAll(".chip");

// Core Function: Fetch and Render Images
async function executeSearch(query) {
  const trimmedQuery = query.trim();
  
  // Requirement: Ignore empty searches
  if (!trimmedQuery) return;

  // Clear previous results and hide the initial empty state message
  resultsContainer.innerHTML = "";
  if (emptyState) {
    emptyState.style.display = "none";
  }

  // Update status message
  statusText.textContent = `Searching for "${trimmedQuery}"...`;

  // Construct Wikimedia Commons API URL
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query" +
    "&generator=search&gsrsearch=" + encodeURIComponent(trimmedQuery) +
    "&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*";

  try {
    const response = await fetch(url);
    
    // Check if response is OK
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if query pages exist
    if (!data.query || !data.query.pages) {
      statusText.textContent = `No images found for "${trimmedQuery}". Try another keyword.`;
      return;
    }

    const items = Object.values(data.query.pages);

    // ENHANCEMENT 1: Display result count
    statusText.textContent = `Showing ${items.length} results for "${trimmedQuery}"`;

    // Render image cards into DOM
    renderResults(items);

  } catch (error) {
    console.error("Fetch error:", error);
    statusText.textContent = "Unable to fetch images. Please try again.";
  }
}

// Function to dynamically build card elements
function renderResults(items) {
  items.forEach((item) => {
    // Validate imageinfo payload
    if (!item.imageinfo || !item.imageinfo[0]) return;

    const imgInfo = item.imageinfo[0];
    const thumbUrl = imgInfo.thumburl || imgInfo.url;
    const fullImageUrl = imgInfo.url;
    // Strip 'File:' prefix from Wikimedia title
    const title = item.title ? item.title.replace(/^File:/, "") : "Untitled Image";

    // Build Card Article
    const card = document.createElement("article");
    card.className = "card";

    // ENHANCEMENT 2: Make card a clickable link to open full image in a new tab
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

    // Append card to responsive grid container
    resultsContainer.appendChild(card);
  });
}

// Requirement: Catch search form submit event
searchForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent page reload
  executeSearch(searchInput.value);
});

// ENHANCEMENT 3: Wire category suggestion chips to execute instant search
categoryChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const term = chip.textContent;
    searchInput.value = term;
    executeSearch(term);
  });
});