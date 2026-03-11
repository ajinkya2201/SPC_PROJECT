let images = [];           // table 1 -> [{id, name}]
let slideshowImages = [];  // table 2 -> [id]
let slideshowIndex = 0;
let slideshowTimer = null;
let db;

/* -------------------- IndexedDB -------------------- */

const request = indexedDB.open("ImageGalleryDB", 1);

request.onupgradeneeded = (e) => {
  db = e.target.result;
  db.createObjectStore("images", { keyPath: "id" });
};

request.onsuccess = (e) => {
  db = e.target.result;
};

function saveImageToDB(id, file) {
  const tx = db.transaction("images", "readwrite");
  tx.objectStore("images").put({ id, blob: file });
}

function loadImageFromDB(id, callback) {
  const tx = db.transaction("images", "readonly");
  const req = tx.objectStore("images").get(id);

  req.onsuccess = () => {
    if (!req.result) return;
    const url = URL.createObjectURL(req.result.blob);
    callback(url);
  };
}

/* -------------------- Image Select -------------------- */

function selectImages() {
  document.getElementById("imgInput").click();
}

document.getElementById("imgInput").addEventListener("change", (e) => {
  [...e.target.files].forEach(file => {
    const id = crypto.randomUUID();
    images.push({ id, name: file.name });
    saveImageToDB(id, file);
  });
  renderGallery();
});

/* -------------------- Gallery -------------------- */

function renderGallery() {

  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  images.forEach(img => {

    loadImageFromDB(img.id,(url)=>{

      const wrapper = document.createElement("div");
      wrapper.className = "image-wrapper";

      const el = document.createElement("img");
      el.src = url;

      const badge = document.createElement("div");
      badge.className = "count-badge";

      const count = getImageCount(img.id);

      badge.textContent = count;

      if(count === 0){
        badge.classList.add("hidden");
      }

      el.onclick = () => toggleSelect(img.id);

      wrapper.appendChild(el);
      wrapper.appendChild(badge);

      gallery.appendChild(wrapper);

    });

  });

}

function toggleSelect(id){

  slideshowImages.push(id);

  renderGallery();   

}

/* -------------------- Slideshow -------------------- */

function startSlideshow() {

  if (!slideshowImages.length) {
    alert("No images selected for slideshow");
    return;
  }

  pauseSlideshow();

  const intervalValue = parseInt(document.getElementById("intervalSelect").value);
  const intervalTime = intervalValue * 1000;

  slideshowTimer = setInterval(() => {

    const id = slideshowImages[slideshowIndex];

    loadImageFromDB(id, (url) => {
      document.getElementById("slideshowImg").src = url;
    });

    slideshowIndex = (slideshowIndex + 1) % slideshowImages.length;

  }, intervalTime);
}


function pauseSlideshow() {

  clearInterval(slideshowTimer);
  slideshowTimer = null;
}

/* -------------------- Delete -------------------- */

function deleteSelected() {
  const tx = db.transaction("images", "readwrite");
  const store = tx.objectStore("images");

  slideshowImages.forEach(id => store.delete(id));

  images = images.filter(img => !slideshowImages.includes(img.id));
  slideshowImages = [];

  renderGallery();
}

/* -------------------- Save / Load JSON -------------------- */

function saveJSON() {
  const data = {
    allImages: images,
    slideshowImages: slideshowImages
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gallery.json";
  a.click();
}

function loadJSON() {
  document.getElementById("jsonInput").click();
}

document.getElementById("jsonInput").addEventListener("change", (e) => {
  const reader = new FileReader();
  reader.onload = () => {
    const data = JSON.parse(reader.result);
    images = data.allImages || [];
    slideshowImages = data.slideshowImages || [];
    renderGallery();
  };
  reader.readAsText(e.target.files[0]);
});

// count function 

function getImageCount(id){
  return slideshowImages.filter(imgId => imgId === id).length;
}


// event listner for time select for slideshow 

document.getElementById("intervalSelect").addEventListener("change", () => {

  // if slideshow is running
  if (slideshowTimer !== null) {

    startSlideshow();   // restart slideshow with new interval

  }

});

