gsap.registerPlugin(ScrollTrigger);

const preloader = document.querySelector('.preloader');
const canvas = document.getElementById('sequence');
const context = canvas.getContext('2d');
const frameCount = 240;
const framePath = (index) => `frames/frame-${String(index).padStart(4, '0')}.webp`;
const frames = [];
let currentFrame = -1;

const hidePreloader = () => {
    document.body.classList.remove('is-loading');
    preloader?.classList.add('is-hidden');
};

const drawFrame = (index) => {
    const frame = frames[index];
    if (!frame || index === currentFrame) {
        return;
    }

    currentFrame = index;
    const scale = Math.max(canvas.width / frame.naturalWidth, canvas.height / frame.naturalHeight);
    const width = frame.naturalWidth * scale;
    const height = frame.naturalHeight * scale;
    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(frame, x, y, width, height);
};

const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    currentFrame = -1;
    drawFrame(0);
};

const showSequence = () => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    hidePreloader();

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '.video-section',
            start: 'top top',
            end: '+=300%',
            scrub: 0.1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
        }
    });

    tl.to({ frame: 0 }, {
        frame: frameCount - 1,
        ease: 'none',
        onUpdate() {
            drawFrame(Math.round(this.targets()[0].frame));
        }
    }).to('.hola', {
        autoAlpha: 1,
        y: -20,
        ease: 'power2.out'
    });
};

const loadFrame = (index) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`No se pudo cargar ${framePath(index)}.`));
    image.src = framePath(index);
});

Promise.all(Array.from({ length: frameCount }, (_, index) => loadFrame(index + 1)))
    .then((loadedFrames) => {
        frames.push(...loadedFrames);
        showSequence();
    })
    .catch((error) => {
        hidePreloader();
        console.error(error);
    });
