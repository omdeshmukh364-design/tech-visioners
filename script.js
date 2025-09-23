// Counter animation for statistics
function animateCounters() {
  const counters = document.querySelectorAll(".stat-card h3");
  const speed = 200; // smaller = faster

  counters.forEach(counter => {
    const target = +counter.innerText.replace(/[^0-9.]/g, ""); // extract number only
    let current = 0;

    const updateCounter = () => {
      const increment = target / speed;
      if (current < target) {
        current += increment;
        counter.innerText = Math.floor(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        counter.innerText = target.toLocaleString();
      }
    };

    updateCounter();
  });
}

// Run animation only when stats section is visible
function handleScroll() {
  const statsSection = document.querySelector("#stats");
  const sectionTop = statsSection.getBoundingClientRect().top;
  const triggerPoint = window.innerHeight - 100;

  if (sectionTop < triggerPoint) {
    animateCounters();
    window.removeEventListener("scroll", handleScroll); // run only once
  }
}

window.addEventListener("scroll", handleScroll);
