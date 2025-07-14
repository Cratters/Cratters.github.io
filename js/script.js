
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
        if(page == 'ai')
        {
          for(let i = 1; i <= 7; i++)
          {
            loadCarouselFromJson('ai', `info_${i}.json`, `gallery_${i}`);
          }
        }
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
        figure.className = "col-12 col-md-4 col-lg-3 item box";
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




function loadCarouselFromJson(folder, infoFile, carouselId) {
  fetch(`img/${folder}/${infoFile}`)
    .then(res => res.json())
    .then(imageList => {
      const container = document.getElementById(carouselId);
      container.innerHTML = '';

      const carousel = document.createElement('div');
      carousel.id = carouselId;
      carousel.className = 'carousel slide';
      carousel.setAttribute('data-bs-ride', 'carousel');

      const inner = document.createElement('div');
      inner.className = 'carousel-inner';

      const hasMultipleImages = imageList.length > 1;

      const indicators = document.createElement('div');
      indicators.className = 'carousel-indicators';

      imageList.forEach((item, index) => {
        const imgSrc = `img/${folder}/${item.src}`;

        // Carousel Indicators (only if multiple)
        if (hasMultipleImages) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.setAttribute('data-bs-target', `#${carouselId}`);
          btn.setAttribute('data-bs-slide-to', index);
          btn.setAttribute('aria-label', `Slide ${index + 1}`);
          if (index === 0) {
            btn.classList.add('active');
            btn.setAttribute('aria-current', 'true');
          }
          indicators.appendChild(btn);
        }

        // Carousel Item
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item' + (index === 0 ? ' active' : '');

        // Fancybox clickable image
        const a = document.createElement('a');
        a.href = imgSrc;
        a.setAttribute('data-fancybox', `${carouselId}-gallery`);
        a.setAttribute('data-caption', item.caption || item.title || '');

        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'd-block w-100';
        img.alt = item.caption || '';

        a.appendChild(img);
        carouselItem.appendChild(a);

        // Caption
        if (item.title || item.caption) {
          const caption = document.createElement('div');
          caption.className = 'carousel-caption d-none d-md-block';

          if (item.title) {
            const h5 = document.createElement('h5');
            h5.textContent = item.title;
            caption.appendChild(h5);
          }

          if (item.caption) {
            const p = document.createElement('p');
            p.textContent = item.caption;
            caption.appendChild(p);
          }

          carouselItem.appendChild(caption);
        }

        inner.appendChild(carouselItem);
      });

      carousel.appendChild(inner);

      if (hasMultipleImages) {
        // Only add indicators and controls if more than one image
        carousel.appendChild(indicators);

        const prev = document.createElement('button');
        prev.className = 'carousel-control-prev';
        prev.type = 'button';
        prev.setAttribute('data-bs-target', `#${carouselId}`);
        prev.setAttribute('data-bs-slide', 'prev');
        prev.innerHTML = `
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        `;

        const next = document.createElement('button');
        next.className = 'carousel-control-next';
        next.type = 'button';
        next.setAttribute('data-bs-target', `#${carouselId}`);
        next.setAttribute('data-bs-slide', 'next');
        next.innerHTML = `
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        `;

        carousel.appendChild(prev);
        carousel.appendChild(next);
      }

      container.appendChild(carousel);
    })
    .catch(err => {
      console.error('載入 JSON 失敗:', err);
    });
}
