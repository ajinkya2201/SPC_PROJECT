const data = JSON.parse(localStorage.getItem("slideshowData"));

const slideImage = document.getElementById("slideImage");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const saveJsonBtn = document.getElementById("saveJsonBtn");
const slideTimeInput = document.getElementById("slideTime");

let allImages = data.allImages;
let slideshowImages = data.slideshowImages;

let currentIndex = 0;
let interval = null;

slideTimeInput.value = data.slideTime / 1000;

// show slide
function showSlide(){

const id = slideshowImages[currentIndex];

const imageObj = allImages.find(img => img.id === id);

if(!imageObj) return;

slideImage.src = imageObj.src;

currentIndex = (currentIndex + 1) % slideshowImages.length;

}

// start slideshow
function startSlideshow(){

clearInterval(interval);

const slideTime = slideTimeInput.value * 1000;

interval = setInterval(showSlide, slideTime);

}

// start first slide
showSlide();
startSlideshow();

// pause
pauseBtn.addEventListener("click", function(){
clearInterval(interval);
});

// resume
resumeBtn.addEventListener("click", function(){
startSlideshow();
});

// change slide time
slideTimeInput.addEventListener("change", function(){
startSlideshow();
});

// save JSON
saveJsonBtn.addEventListener("click", function(){

const jsonData = {
allImages: allImages,
slideshowImages: slideshowImages
};

const json = JSON.stringify(jsonData, null, 2);

const blob = new Blob([json], {type:"application/json"});

const a = document.createElement("a");

a.href = URL.createObjectURL(blob);

a.download = "gallery.json";

a.click();

});