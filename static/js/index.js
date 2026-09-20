window.HELP_IMPROVE_VIDEOJS = false;

var POSTER_CACHE_VERSION = '20260903_case085_poster';

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  var wrapper = document.getElementById('interpolation-image-wrapper');
  if (wrapper) {
    wrapper.textContent = '';
    wrapper.appendChild(image);
  }
}

function onReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

function hydrateVideo(video) {
    if (video.dataset.loaded === 'true') {
        return;
    }

    var sources = video.querySelectorAll('source[data-src]');
    sources.forEach(function(source) {
        source.src = source.dataset.src;
    });
    video.dataset.loaded = 'true';
    video.classList.remove('video-awaiting-click');
    var shell = video.closest('.video-shell');
    if (shell) {
        shell.classList.add('video-loaded');
    }
    video.load();

}

function playVideo(video) {
    hydrateVideo(video);
    video.muted = false;
    video.volume = 1;
    video.play().catch(function() {});
}

function setupLazyVideos() {
    function posterPathFromVideo(video) {
        var source = video.querySelector('source[data-src]');
        if (!source) {
            return '';
        }

        return source.dataset.src.replace(/\.mp4$/i, '.jpg') + '?v=' + POSTER_CACHE_VERSION;
    }

    function observeVideo(video) {
        if (video.__flowactLazyReady === true) {
            return;
        }

        video.__flowactLazyReady = true;
        video.dataset.lazyReady = 'true';
        video.preload = 'none';
        video.classList.add('video-awaiting-click');

        var posterPath = posterPathFromVideo(video);
        if (posterPath && !video.getAttribute('poster')) {
            video.setAttribute('poster', posterPath);
        }

        var shell = video.closest('.comparison-method') || video.closest('.item') || video.parentElement;
        if (shell && !shell.classList.contains('video-shell')) {
            shell.classList.add('video-shell');
        }

        if (shell && !shell.querySelector('.video-play-overlay')) {
            var playButton = document.createElement('button');
            playButton.type = 'button';
            playButton.className = 'video-play-overlay';
            playButton.setAttribute('aria-label', 'Play video');
            shell.appendChild(playButton);
        }


    }

    function currentVideos() {
        return Array.from(document.querySelectorAll('video'));
    }

    function scanVideos() {
        currentVideos().forEach(function(video) {
            observeVideo(video);
        });
    }

    document.addEventListener('click', function(event) {
        var playOverlay = event.target.closest && event.target.closest('.video-play-overlay');
        if (playOverlay) {
            event.preventDefault();
            event.stopPropagation();
            var video = playOverlay.closest('.video-shell').querySelector('video');
            playVideo(video);
        }
    }, true);

    document.addEventListener('play', function(event) {
        if (event.target && event.target.tagName === 'VIDEO') {
            currentVideos().forEach(function(video) {
                if (video !== event.target && !video.paused) {
                    video.pause();
                }
            });
            hydrateVideo(event.target);
        }
    }, true);

    scanVideos();

    if ('MutationObserver' in window) {
        var mutationObserver = new MutationObserver(scanVideos);
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

function setupInterpolationImages() {
    if (!document.getElementById('interpolation-slider') || !document.getElementById('interpolation-image-wrapper')) {
        return;
    }

    preloadInterpolationImages();

    var interpolationSlider = document.getElementById('interpolation-slider');
    interpolationSlider.addEventListener('input', function() {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    interpolationSlider.max = NUM_INTERP_FRAMES - 1;
}


onReady(function() {
    setupLazyVideos();

    // Check for click events on the navbar burger icon
    document.querySelectorAll('.navbar-burger').forEach(function(burger) {
      burger.addEventListener('click', function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      document.querySelectorAll('.navbar-burger').forEach(function(item) {
        item.classList.toggle('is-active');
      });
      document.querySelectorAll('.navbar-menu').forEach(function(item) {
        item.classList.toggle('is-active');
      });

      });
    });

    // Teaser carousel options (显示2个视频)
    var teaserOptions = {
        slidesToScroll: 1,
        slidesToShow: 2,
        loop: true,
        infinite: true,
        autoplay: false,
        autoplaySpeed: 3000,
    }

    // Diversity carousel options (显示4个视频)
    var diversityOptions = {
        slidesToScroll: 1,
        slidesToShow: 4,
        loop: true,
        infinite: true,
        autoplay: false,
        autoplaySpeed: 3000,
    }

    // Pose carousel options (显示3个视频)
    var poseOptions = {
        slidesToScroll: 1,
        slidesToShow: 3,
        loop: true,
        infinite: true,
        autoplay: false,
        autoplaySpeed: 3000,
    }

    // 所有carousel的通用配置
    var carouselOptions = {
        navigation: true,
        pagination: true,
        loop: true,
        infinite: true,
        autoplay: false,
        autoplaySpeed: 3000,
    }

    function attachCarousel(selector, options) {
        if (!document.querySelector(selector) || typeof bulmaCarousel === 'undefined') {
            return null;
        }

        var instances = bulmaCarousel.attach(selector, options);
        instances.forEach(function(instance) {
            if (instance._swipe && typeof instance._swipe.unbindEvents === 'function') {
                instance._swipe.unbindEvents();
            }

            [
                { element: instance.wrapper.querySelector('.slider-navigation-previous'), label: 'Previous slide' },
                { element: instance.wrapper.querySelector('.slider-navigation-next'), label: 'Next slide' },
            ].forEach(function(control) {
                if (!control.element) {
                    return;
                }
                control.element.setAttribute('role', 'button');
                control.element.setAttribute('tabindex', '0');
                control.element.setAttribute('aria-label', control.label);
                control.element.addEventListener('keydown', function(event) {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        control.element.click();
                    }
                });
            });
        });
        return instances;
    }

    // 不再使用轮播功能，移除teaser轮播的初始化代码
    // var teaserCarousel = bulmaCarousel.attach('#results-carousel', {
    //     ...carouselOptions,
    //     slidesToShow: 4,
    //     slidesToScroll: 1,
    //     loop: true
    // });

    attachCarousel('#video-chatting-carousel', {
        ...carouselOptions,
        slidesToShow: 1,
        slidesToScroll: 1,
    });

    attachCarousel('#entertainment-carousel', {
        ...carouselOptions,
        slidesToShow: 4,
        slidesToScroll: 1,
    });

    attachCarousel('#offline-carousel', {
        ...carouselOptions,
        slidesToShow: 4,
        slidesToScroll: 1,
    });

    attachCarousel('#shopping-carousel', {
        ...carouselOptions,
        slidesToShow: 4,
        slidesToScroll: 1,
    });

    attachCarousel('#gaming-carousel', {
        ...carouselOptions,
        slidesToShow: 1,
        slidesToScroll: 1,
    });

    attachCarousel('#sota-video-carousel', {
        ...carouselOptions,
        slidesToShow: 2,
        slidesToScroll: 2,
        loop: true,
        infinite: false,
        breakpoints: [
            { changePoint: 480, slidesToShow: 1, slidesToScroll: 1 },
            { changePoint: 640, slidesToShow: 1, slidesToScroll: 1 },
            { changePoint: 768, slidesToShow: 1, slidesToScroll: 1 },
        ],
    });

    // Keep the comparison videos static; bulmaCarousel empties this block.
    // attachCarousel('#pose-carousel', {
    //     ...carouselOptions,
    //     slidesToShow: 1,
    //     slidesToScroll: 1,
    // });

    attachCarousel('#portrait-carousel', {
        ...carouselOptions,
        slidesToShow: 1,
        slidesToScroll: 1,
    });

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    setupInterpolationImages();

    if (typeof bulmaSlider !== 'undefined') {
        bulmaSlider.attach();
    }

    attachCarousel('#control-carousel', {
        ...carouselOptions,
        slidesToShow: 2,
        slidesToScroll: 1,
    });

    attachCarousel('#interaction-carousel', {
        ...carouselOptions,
        slidesToShow: 2,
        slidesToScroll: 1,
    });

})
