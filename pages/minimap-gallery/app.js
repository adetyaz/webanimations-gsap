import gsap from "gsap";

const container = document.querySelector(".container");
const items = document.querySelector(".items");
const indicator = document.querySelector(".indicator");
const itemElements = document.querySelectorAll(".item");
const previewImage = document.querySelector(".img-preview img");
const itemImages = document.querySelectorAll(".item img");

//Setup for mobile and webscreen
let isHorizontal = window.innerWidth <= 900;

// dimension variable that allow the minimap work
let dimensions = {
  itemSize: 0,
  containerSize: 0,
  indicatorSize: 0,
};

// Variables to control how far the minimap can move and where it should stop
let maxTranslate = 0;
let currentTranslate = 0;
let targetTranslate = 0;

// Check to see if any image is clicked
let isClickMove = false;

//Set the current image index
let currentImageIndex = 0;
const activeItemOpacity = 0.3;

// Setup linear interpolation for scrolling effects and animations
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

// Managing the responsiveness of the minimap,
// this function determines whether the minmap should be displayed horizontally orr vertically
function updateDimensions() {
  isHorizontal = window.innerWidth <= 900;

  if (isHorizontal) {
    dimensions = {
      itemSize: itemElements[0].getBoundingClientRect().width,
      containerSize: items.scrollWidth,
      indicatorSize: indicator.getBoundingClientRect().width,
    };
  } else {
    dimensions = {
      itemSize: itemElements[0].getBoundingClientRect().height,
      containerSize: items.getBoundingClientRect().height,
      indicatorSize: indicator.getBoundingClientRect().height,
    };
  }

  console.log("itemElements", itemElements[0]);
  console.log("new Dimensions", dimensions);
  return dimensions;
}

dimensions = updateDimensions();

//defines the maximum distance the minimap can scroll
maxTranslate = dimensions.containerSize - dimensions.indicatorSize;
console.log(maxTranslate);

function getItemInIndicator() {
  // Ensure that no image is highlighted at the start
  itemImages.forEach((img) => (img.style.opacity = 1));
  // Calculate where the indicator starts and ends based on the current scroll position
  const indicatorStart = -currentTranslate;
  const indicatorEnd = indicatorStart + dimensions.indicatorSize;

  console.log("Current Indicator End", indicatorEnd);

  let maxOverlap = 0;
  let selectedIndex = 0;

  // We'll loop through each minimap item to check how much it overlaps with the indicator
  itemElements.forEach((item, index) => {
    const itemStart = index * dimensions.itemSize;
    const itemEnd = itemStart + dimensions.itemSize;

    console.log("Where Item Start", itemStart);
    console.log("Where Item Ends", itemEnd);

    //Item with the most overlap will be the one selected
    const overlapStart = Math.max(indicatorStart, itemStart);
    const overlapEnd = Math.min(indicatorEnd, itemEnd);
    const overlap = Math.max(0, overlapEnd - overlapStart);

    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      selectedIndex;
    }
  });

  // Apply opacity to the image in the selected index
  itemImages[selectedIndex].style.opacity = activeItemOpacity;

  return selectedIndex;
}

function updatePreviewImage(index) {
  // Check if selected image is different from the current iamge
  if (currentImageIndex !== index) {
    // update the current image
    currentImageIndex = index;
    const targetItem = itemElements[index].querySelector("img");
    const targetSrc = targetItem.getAttribute("src");
    previewImage.setAttribute("src", targetSrc);
  }
}

function animate() {
  const lerpFactor = isClickMove ? 0.05 : 0.075;
  currentTranslate = lerp(currentTranslate, targetTranslate, lerpFactor);

  console.log("Current Translate animate()", currentTranslate);
  console.log("Target translate animate()", targetTranslate);

  if (Math.abs(currentTranslate - targetTranslate) > 0.01) {
    const transform = isHorizontal
      ? `translateX(${currentTranslate}px)`
      : `translateY(${currentTranslate}px)`;
    items.style.transform = transform;

    const activeIndex = getItemInIndicator();
    updatePreviewImage(activeIndex);
  } else {
    isClickMove = false;
  }

  requestAnimationFrame(animate);
}

container.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    isClickMove = false;

    let delta;
    delta = e.deltaY;

    const scrollVelocity = Math.min(Math.max(delta * 0.5, -20), 20);

    console.log("ScrollVelocity Wheel", scrollVelocity);

    targetTranslate = Math.min(
      Math.max(targetTranslate - scrollVelocity, -maxTranslate),
      0
    );
  },
  { passive: false }
);

let touchStartY = 0;
container.addEventListener("touchstart", (e) => {
  if (isHorizontal) {
    touchStartY = e.touches[0].clientY;

    console.log("touch start", touchStartY);
  }
});

container.addEventListener(
  "touchmove",
  (e) => {
    if (isHorizontal) {
      const touchY = e.touches[0].clientY;

      const deltaY = touchStartY - touchY;
      const delta = deltaY;

      const scrollVelocity = Math.min(Math.max(delta * 0.5, -20), 20);
      console.log("Scroll Velocity Touch", scrollVelocity);

      targetTranslate = Math.min(
        Math.max(targetTranslate - scrollVelocity, -maxTranslate),
        0
      );

      touchStartY = touchY;
      e.preventDefault();
    }
  },
  { passive: false }
);

itemElements.forEach((item, index) => {
  item.addEventListener("click", () => {
    isClickMove = true;

    targetTranslate =
      -index * dimensions.itemSize +
      (dimensions.indicatorSize - dimensions.itemSize) / 2;

    console.log("items element target", targetTranslate);

    targetTranslate = Math.max(Math.min(targetTranslate, 0), -maxTranslate);
  });
});

window.addEventListener("resize", () => {
  dimensions = updateDimensions();
  console.log("resize dimensions", dimensions);

  const newMaxTranslate = dimensions.containerSize - dimensions.indicatorSize;

  targetTranslate = Math.min(Math.max(targetTranslate, -newMaxTranslate), 0);
  currentTranslate = targetTranslate;

  const transform = isHorizontal
    ? `translateX(${currentTranslate}px)`
    : `translateY(${currentTranslate}px)`;
  items.style.transform = transform;
});

itemImages[0].style.opacity = activeItemOpacity;
updatePreviewImage(0);
animate;
