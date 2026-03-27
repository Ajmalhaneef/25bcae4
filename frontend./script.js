// script.js

// ============================
// Section Scroll Animation
// ============================
const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }
    });
}, { threshold: 0.2 });

sections.forEach(sec => observer.observe(sec));

// ============================
// Contact Form Submission
// ============================
const form = document.getElementById("contactForm");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  try {
    const response = await fetch("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to send message");
    }

    alert(data.message || "Message sent!");
    form.reset();
  } catch (err) {
    console.error("Error submitting form:", err);
    alert("There was an error sending your message. " + err.message);
  }
});