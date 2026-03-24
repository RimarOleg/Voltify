fetch("data/items.json")
  .then(response => response.json())
  .then(data => {
      document.getElementById("image").src = data.image;
  })
  .catch(error => console.log("Помилка:", error));