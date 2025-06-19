
function toggleDarkMode() {
    const body = document.body;
    const isDarkMode = body.classList.toggle("dark-mode");

    const toggleButton = document.querySelector(".toggle-dark-mode");
    const toggleIcon = toggleButton.querySelector("i");
    toggleIcon.classList.toggle("fas fa-moon");
    toggleIcon.classList.toggle("fas fa-sum");

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
    fetch(`content/${page}.html`)
      .then(response => response.text())
      .then(data => {
        const content = document.querySelector('#content');
        content.innerHTML = data;
        if(page == 'original') loadImage('original', 'gallery_original');
        if(page == 'commission') loadImage('commission', 'gallery_commission');
        if(page == 'fanart') loadImage('fanart', 'gallery_fanart');
        if(page == 'clay') loadImage('clay', 'gallery_clay');
      })
      .catch(error => {
        console.error(`Error loading ${page}.html`, error);
        const content = document.querySelector('#content');
        fetch('content/home.html')
          .then(response => response.text())
          .then(data => {
            content.innerHTML = data;
          });
      });
  });
});

document.addEventListener("DOMContentLoaded", function() {
    const content = document.querySelector('#content');
    fetch('content/home.html')
      .then(response => response.text())
      .then(data => {
        content.innerHTML = data;
      })
      .catch(error => {
        console.error('Failed to load default content', error);
      });
  });

function loadImage(folder, id) {
  fetch(`img/${folder}/info.json`)
    .then(res => res.json())
    .then(imageList => {
      const gallery = document.getElementById(id);
      gallery.innerHTML = '';

      imageList.forEach(({ src, caption }) => {
        const fullPath = `img/${folder}/${src}`;

        const img = document.createElement('img');
        img.className = "img img-fluid";
        img.src = fullPath;
        img.alt = caption;

        const a = document.createElement('a');
        a.href = fullPath;
        a.dataset.fancybox = 'gallery';
        a.dataset.caption = caption;
        a.title = caption;
        a.appendChild(img);

        const figure = document.createElement('div');
        figure.className = "col-sm-6 col-md-4 col-lg-3 item box";
        figure.appendChild(a);

        gallery.appendChild(figure);
      });

      // 確保圖片載入後再初始化 masonry
      $('.masonry').imagesLoaded(function () {
        $('.masonry').masonry({
          itemSelector: '.item'
        });
      });
    })
    .catch(err => {
      console.error('讀取 JSON 失敗', err);
    });
}
