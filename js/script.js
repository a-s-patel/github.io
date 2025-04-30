console.log("✅ script.js loaded successfully!");
document.addEventListener("DOMContentLoaded", function () {
  // Calculator Animation
  const calculatorButtons = document.querySelectorAll(".bg-primary");
  calculatorButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      const card = this.closest(".card-hover");
      const resultValue = card.querySelector(".result-value");
      const resultContainer = resultValue.parentElement;
      this.classList.add("calculating");
      setTimeout(() => {
        resultContainer.classList.add("result-flash");
        this.classList.remove("calculating");
        setTimeout(() => {
          resultContainer.classList.remove("result-flash");
        }, 800);
      }, 500);
    });
  });

  // Dark Mode Toggle
  const darkModeToggle = document.getElementById("darkModeToggle");
  darkModeToggle.addEventListener("change", function () {
    if (this.checked) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  });

  // Case Studies Carousel
  const caseStudiesContainer = document.getElementById("caseStudiesContainer");
  const prevCaseBtn = document.getElementById("prevCase");
  const nextCaseBtn = document.getElementById("nextCase");
  let scrollAmount = 0;
  const scrollStep = 400;

  const cards = document.querySelectorAll(".card-hover");
  cards.forEach((card) => {
    card.addEventListener("click", function (e) {
      if (!e.target.closest("button")) {
        window.location.href = this.getAttribute("href");
      }
    });
  });

  nextCaseBtn.addEventListener("click", function () {
    scrollAmount += scrollStep;
    if (scrollAmount > caseStudiesContainer.scrollWidth - caseStudiesContainer.clientWidth) {
      scrollAmount = caseStudiesContainer.scrollWidth - caseStudiesContainer.clientWidth;
    }
    caseStudiesContainer.scroll({
      left: scrollAmount,
      behavior: "smooth",
    });
  });

  prevCaseBtn.addEventListener("click", function () {
    scrollAmount -= scrollStep;
    if (scrollAmount < 0) {
      scrollAmount = 0;
    }
    caseStudiesContainer.scroll({
      left: scrollAmount,
      behavior: "smooth",
    });
  });
});
