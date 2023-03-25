
function toggleDarkMode() {
    const body = document.body;
    const isDarkMode = body.classList.toggle("dark-mode");

    const toggleButton = document.querySelector(".toggle-dark-mode");
    const toggleIcon = toggleButton.querySelector("i");
    toggleIcon.classList.toggle("fa-toggle-on");
    toggleIcon.classList.toggle("fa-toggle-off");

    localStorage.setItem('isDarkMode', isDarkMode);
}

const darkModeToggle = document.querySelector(".toggle-dark-mode");
let isDarkMode = JSON.parse(localStorage.getItem('isDarkMode'));

if (isDarkMode === null) {
    isDarkMode = false;
}

if (isDarkMode) {
    enableDarkMode();
}

darkModeToggle.addEventListener('click', function() {
    if (isDarkMode) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
});

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('isDarkMode', true);
    isDarkMode = true;
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('isDarkMode', false);
    isDarkMode = false;
}

const links = document.querySelectorAll('.link');
links.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const page = link.dataset.page;
    fetch(`/content/${page}.html`)
      .then(response => response.text())
      .then(data => {
        const content = document.querySelector('#content');
        content.innerHTML = data;
      })
      .catch(error => {
        console.error(`Error loading ${page}.html`, error);
        const content = document.querySelector('#content');
        fetch('/content/home.html')
          .then(response => response.text())
          .then(data => {
            content.innerHTML = data;
          });
      });
  });
});

document.addEventListener("DOMContentLoaded", function() {
    const content = document.querySelector('#content');
    fetch('/content/home.html')
      .then(response => response.text())
      .then(data => {
        content.innerHTML = data;
      })
      .catch(error => {
        console.error('Failed to load default content', error);
      });
  });
  