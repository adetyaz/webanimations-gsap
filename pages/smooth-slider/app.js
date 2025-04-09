const backgroundContainer = document.querySelector(".preview-image");
const backgroundImages = document.querySelectorAll(".preview-image img");

document.addEventListener("DOMContentLoaded", () => {
  let currentIndex = 0;
  const itemCount = backgroundImages.length;
  const scrollDuration = 1000;
  const pauseDuration = 3000;

  function scrollToNextItem() {
    currentIndex = (currentIndex + 1) % itemCount;
    const targetPosition = currentIndex * window.innerWidth;

    backgroundContainer.scrollTo({
      left: targetPosition,
      behavior: "smooth",
    });

    setTimeout(scrollToNextItem, scrollDuration + pauseDuration);
  }

  setTimeout(scrollToNextItem, pauseDuration);
});
