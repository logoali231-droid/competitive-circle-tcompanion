// Initialize FlexSearch document index
const index = new FlexSearch.Document({
  document: {
    id: "id",
    index: ["title", "category", "text", "keywords"]
  },
  tokenize: "forward",
  cache: true,
  context: true
});

// Add all search data
SEARCH_DATA.forEach(item => index.add(item));

const input = document.getElementById("search");
const box = document.getElementById("results");

input.addEventListener("input", async (e) => {
  const q = e.target.value.trim();
  if (!q) {
    box.innerHTML = "";
    return;
  }

  const results = await index.searchAsync(q, { enrich: true });
  // Combine results from all fields, deduplicate by ID
  const seen = new Set();
  const flat = [];
  results.forEach(r => {
    r.result.forEach(doc => {
      if (!seen.has(doc.id)) {
        seen.add(doc.id);
        flat.push(doc);
      }
    });
  });

  render(flat.slice(0, 8));
});

function render(items) {
  box.innerHTML = items.map(item => `
    <div class="result" data-id="${item.id}">
      <div class="title">${highlight(item.title)}</div>
      <div class="category">${item.category}</div>
    </div>
  `).join("");
}

// Highlight matching terms (simple)
function highlight(text) {
  const q = input.value.trim();
  if (!q) return text;
  const words = q.split(/\s+/).filter(w => w.length > 1);
  let result = text;
  words.forEach(word => {
    const regex = new RegExp(`(${escapeRegExp(word)})`, "gi");
    result = result.replace(regex, '<mark>$1</mark>');
  });
  return result;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Click to scroll to element and open its <details>
document.addEventListener("click", (e) => {
  const el = e.target.closest(".result");
  if (!el) return;
  const id = el.dataset.id;
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth" });
  const details = target.closest("details");
  if (details) details.open = true;
  box.innerHTML = ""; // clear after selection
});
