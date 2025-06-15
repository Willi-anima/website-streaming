const CHANNEL = "animatime";
const PER_PAGE = 10;
let allVideos = [];
let currentPage = 1;

document.addEventListener("DOMContentLoaded", () => {
  fetchVideos();
  setupSearch();
  setupTheme();
  startHeroSlider();
  setupGenreFilter();   // ✅ Tambahkan ini
  loadVideoDetail();      // Tampilkan video
  setupVideoComments();
});

function fetchVideos() {
  fetch(`https://api.dailymotion.com/user/${CHANNEL}/videos?fields=id,title,description,thumbnail_720_url&limit=100`)
    .then(res => res.json())
    .then(data => {
      allVideos = data.list;
      displayVideos(paginate(allVideos, currentPage));
      setupPagination(allVideos.length, currentPage);
    });
}

function displayVideos(videos) {
  const container = document.getElementById("videoList");
  container.innerHTML = "";
  videos.forEach(video => {
    const div = document.createElement("div");
    div.className = "card";
    div.onclick = () => {
      window.location.href = `video.html?id=${video.id}`;
    };
    div.innerHTML = `
      <img src="${video.thumbnail_720_url}" alt="${video.title}">
      <div class="card-title">${video.title}</div>
    `;
    container.appendChild(div);
  });
}

function paginate(items, page) {
  const start = (page - 1) * PER_PAGE;
  return items.slice(start, start + PER_PAGE);
}

function setupPagination(totalItems, current) {
  const totalPages = Math.ceil(totalItems / PER_PAGE);
  const container = document.getElementById("pagination");
  container.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === current) btn.disabled = true;
    btn.onclick = () => {
      currentPage = i;
      displayVideos(paginate(allVideos, currentPage));
      setupPagination(allVideos.length, currentPage);
    };
    container.appendChild(btn);
  }
}

function setupSearch() {
  const form = document.querySelector(".search-form");
  const input = document.getElementById("searchInput");

  if (!form || !input) {
    console.warn("Elemen search form tidak ditemukan.");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = input.value.trim().toLowerCase();
    if (!keyword) {
      displayVideos(paginate(allVideos, currentPage));
      setupPagination(allVideos.length, currentPage);
    } else {
      const filtered = allVideos.filter(v => v.title.toLowerCase().includes(keyword));
      displayVideos(filtered);
      document.getElementById("pagination").innerHTML = "";
    }
  });
}

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.checked = true;
  }

  themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  });
}

const sliderImages = [
  "keramat2.jpg",
  "ketindihan.jpg",
  "pengantiniblis.jpg",
  "pengantinsetan.jpg"
];
let currentImage = 0;

function startHeroSlider() {
  const heroImg = document.getElementById("heroImage");
  setInterval(() => {
    currentImage = (currentImage + 1) % sliderImages.length;
    heroImg.src = sliderImages[currentImage];
  }, 5000);
}

const GENRE_KEYWORDS = {
  horror: ["horror", "horor", "terror"],
  drama: ["drama"],
  action: ["action", "aksi"],
  comedy: ["comedy", "komedi", "fun"]
};

function detectGenre(title) {
  const t = title.toLowerCase();
  return Object.keys(GENRE_KEYWORDS).find(genre =>
    GENRE_KEYWORDS[genre].some(keyword => t.includes(keyword))
  ) || "others";
}

function setupGenreFilter() {
  const buttons = document.querySelectorAll("#genreFilter button");
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const selectedGenre = button.dataset.genre;

      buttons.forEach(b => b.classList.remove("active"));
      button.classList.add("active");

      if (selectedGenre === "all") {
        displayVideos(paginate(allVideos, currentPage));
        setupPagination(allVideos.length, currentPage);
      } else {
        const filtered = allVideos.filter(v => {
          const combined = `${v.title} ${v.description}`.toLowerCase();
          return combined.includes(selectedGenre);
        });
        displayVideos(filtered);
        document.getElementById("pagination").innerHTML = "";
      }
    });
  });
}

function setupVideoComments() {
  const commentForm = document.getElementById("commentForm");
  const commentList = document.getElementById("commentList");
  const videoId = new URLSearchParams(window.location.search).get("id");

  console.log("videoId:", videoId);
  console.log("commentForm:", commentForm);
  console.log("commentList:", commentList);

  // Jika elemen komentar tidak ada (misal bukan di video.html), keluar
  if (!commentForm || !commentList || !videoId) {
    console.warn("Komentar tidak diinisialisasi.");
    return;
  }
  loadComments();

  commentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("commentName").value.trim();
    const text = document.getElementById("commentText").value.trim();
    if (!name || !text) return;

    const comment = {
      name,
      text,
      time: new Date().toLocaleString()
    };

    let comments = JSON.parse(localStorage.getItem("comments_" + videoId)) || [];
    comments.push(comment);
    localStorage.setItem("comments_" + videoId, JSON.stringify(comments));

    commentForm.reset();
    loadComments();
  });

  function loadComments() {
    const comments = JSON.parse(localStorage.getItem("comments_" + videoId)) || [];
    commentList.innerHTML = "";
    comments.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment-item";
      div.innerHTML = `<div class="name">${c.name} <small style="float:right;">${c.time}</small></div><div>${c.text}</div>`;
      commentList.appendChild(div);
    });
  }
}


