document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");

  fetch(`/success.html?session_id=${sessionId}`)
    .then((response) => response.text())
    .then((html) => {
      console.log("html");
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const lineItems = doc.querySelectorAll("#ordered-items li");
      const ul = document.getElementById("ordered-items");

      lineItems.forEach((item) => {
        ul.appendChild(item);
      });
    })
    .catch((error) => console.log("Error fetching ordered items: ", error));
});
