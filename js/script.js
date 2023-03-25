
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
        if(page == 'art') loadImage();
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

function loadImage() {      
  console.log('載入圖片');
  const gallery = document.querySelector('#gallery');
  const images = [];

  for (let i = 1; i <= 19; i++) {
    images.push({
      src: `/images/art/${i}.png`,
      caption: `Image ${i}`
    });
  }

  // 生成圖片元素
  function createImageElement(image) {
    const img = document.createElement('img');
    img.src = image.src;
    img.className = "img img-fluid";
    const a = document.createElement('a');
    a.dataset.fancybox = 'gallery',
    a.href = image.src,
    a.appendChild(img);
    const figure = document.createElement('div');
    figure.className="col-sm-6 col-md-3 col-lg-2 col-xl-2 item box"
    figure.appendChild(a);
    gallery.appendChild(figure);
  };

  // 生成圖片
  images.forEach(createImageElement);
    
  $(function(){
    $('.masonry').masonry({
        itemSelector: '.item'
    });
  });
  $(function(){
      var $container = $('.masonry');
      $container.imagesLoaded(function(){
          $container.masonry({
          itemSelector: '.item'
          })
      });
  });

  // 使用 imagesLoaded 確保所有圖片都已載入
  imagesLoaded(gallery, function() {
    masonry.layout();
  });
}