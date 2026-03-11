
// 1. add time to the slideshowImages
// 2. select mutliple images 
// 3. change the order of the selected images 
// 4. deselect the images from the slideshow timeline

const imageInput = document.getElementById("imageInput");
const previewContainer = document.getElementById("previewContainer");
const timeline = document.getElementById("timeline");

const startBtn = document.getElementById("startSlideshow");
const pauseBtn = document.getElementById("pauseSlideshow");
const slideImage = document.getElementById("slideImage");
const slideTimeInput = document.getElementById("slideTime");

const saveJsonBtn = document.getElementById("saveJson");
const loadJsonInput = document.getElementById("loadJson");

let allImages = [];
let slideshowImages = [];

let currentIndex = 0;
let interval = null;

let draggedElement = null;

// load images 

imageInput.addEventListener("change", function(){

previewContainer.innerHTML = "";
allImages = [];

Array.from(imageInput.files).forEach(file => {

if(!file.type.startsWith("image/")) return;

const id = crypto.randomUUID();

const reader = new FileReader();

reader.onload = function(e){

const img = document.createElement("img");

img.src = e.target.result;
img.dataset.id = id;
img.draggable = true;

img.addEventListener("dragstart", dragStart);

previewContainer.appendChild(img);

allImages.push({
id:id,
name:file.name,
src:e.target.result
});

};

reader.readAsDataURL(file);

});

});

// drag start


function dragStart(e){

draggedElement = e.target;

e.dataTransfer.setData("id", e.target.dataset.id);

}

// allow drop


timeline.addEventListener("dragover", function(e){
e.preventDefault();
});

// drop image

timeline.addEventListener("drop", function(e){

e.preventDefault();

const id = e.dataTransfer.getData("id");

const imageObj = allImages.find(img => img.id === id);

if(!imageObj) return;

let element;

// dragged from preview
if(draggedElement.parentElement === previewContainer){

element = document.createElement("img");

element.src = imageObj.src;
element.dataset.id = id;
element.draggable = true;

element.addEventListener("dragstart", dragStart);
element.addEventListener("dblclick", removeFromTimeline);

}else{

// dragged inside timeline
element = draggedElement;

}

// detect drop position
const afterElement = getDragAfterElement(timeline, e.clientX);

if(afterElement == null){
timeline.appendChild(element);
}else{
timeline.insertBefore(element, afterElement);
}

updateSlideshowArray();

});


// detect drop position


function getDragAfterElement(container, x){

const draggableElements = [...container.querySelectorAll("img:not(.dragging)")];

return draggableElements.reduce((closest, child) => {

const box = child.getBoundingClientRect();

const offset = x - box.left - box.width / 2;

if(offset < 0 && offset > closest.offset){
return {offset: offset, element: child};
}else{
return closest;
}

},{offset: Number.NEGATIVE_INFINITY}).element;

}

// update order


function updateSlideshowArray(){

slideshowImages = [];

const images = timeline.querySelectorAll("img");

images.forEach(img=>{
slideshowImages.push(img.dataset.id);
});

}

// remove from timeline 


function removeFromTimeline(e){

e.target.remove();

updateSlideshowArray();

}

// start slideshow 


startBtn.addEventListener("click", function(){

if(slideshowImages.length === 0){
alert("Add images to slideshow first");
return;
}

const slideTime = slideTimeInput.value * 1000;

currentIndex = 0;

clearInterval(interval);

interval = setInterval(()=>{

const id = slideshowImages[currentIndex];

const imageObj = allImages.find(img => img.id === id);

if(!imageObj) return;

slideImage.src = imageObj.src;

currentIndex = (currentIndex + 1) % slideshowImages.length;

}, slideTime);

});

// pause slideshow


pauseBtn.addEventListener("click", function(){

clearInterval(interval);

});

// save json


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


// load json


loadJsonInput.addEventListener("change", function(e){

const file = e.target.files[0];

if(!file) return;

const reader = new FileReader();

reader.onload = function(event){

const data = JSON.parse(event.target.result);

allImages = data.allImages || [];
slideshowImages = data.slideshowImages || [];

previewContainer.innerHTML = "";
timeline.innerHTML = "";


// rebuild preview
allImages.forEach(imgObj=>{

const img = document.createElement("img");

img.src = imgObj.src;
img.dataset.id = imgObj.id;
img.draggable = true;

img.addEventListener("dragstart", dragStart);

previewContainer.appendChild(img);

});


// rebuild timeline
slideshowImages.forEach(id=>{
const imageObj = allImages.find(img => img.id === id);

if(!imageObj) return;

const img = document.createElement("img");

img.src = imageObj.src;
img.dataset.id = id;
img.draggable = true;

img.addEventListener("dragstart", dragStart);
img.addEventListener("dblclick", removeFromTimeline);

timeline.appendChild(img);
});
};
reader.readAsText(file);


const imageInput = document.getElementById("imageInput");
const gallery = document.getElementById("gallery");

imageInput.addEventListener("change", function () {
    gallery.innerHTML = "";   // clear previous images

    const files = Array.from(imageInput.files);

    files.forEach(file => {
        // check if selected file is an image
        if (!file.type.startsWith("image/")) return;

        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.alt = file.name;

        img.style.width = "150px";
        img.style.margin = "10px";
        img.style.borderRadius = "6px";

        gallery.appendChild(img);
    });
});
});
