/* Inline scripts of the original campaign.html, run once Swiper and AOS are available. */
function fpReady(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
  else fn();
}
(function wait(n) {
  if ((window.Swiper && window.AOS) || n > 100) return fpReady(function () {
    fpReady(function () {
          new Swiper("#clienteleSwiper", {
            loop: true,
            slidesPerView: 2,
            spaceBetween: 20,
            autoplay: {
              delay: 2000,
              disableOnInteraction: false,
            },
            breakpoints: {
              640: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
            },
          });
        });
      
    
        AOS.init();
    
        const images = [
          "/images/c1.png",
          "/images/c4.png",
          "/images/c3.png",
          "/images/c2.png",
        ];
        let currentImageIndex = 0;
        const clientImage = document.getElementById("client-image");
    
        setInterval(() => {
          currentImageIndex = (currentImageIndex + 1) % images.length;
          clientImage.src = images[currentImageIndex];
          clientImage.classList.add("animate-fade-scale");
        }, 2000);
  });
  setTimeout(function () { wait(n + 1); }, 100);
})(0);
