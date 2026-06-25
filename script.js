const weddingDate = new Date('2026-11-15T17:00:00-05:00');
function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;
  if (diff <= 0) return;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}
setInterval(updateCountdown, 1000);
updateCountdown();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const music = document.getElementById('music');
const btn = document.getElementById('musicBtn');
btn.addEventListener('click', async () => {
  try {
    if (music.paused) {
      await music.play();
      btn.textContent = '❚❚ Pausar';
    } else {
      music.pause();
      btn.textContent = '♫ Música';
    }
  } catch (e) {
    alert('Agrega un archivo assets/musica.mp3 para activar la música.');
  }
});
