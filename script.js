// Actualizar reloj en tiempo real
function updateClock() {
    const now = new Date();
    document.getElementById('reloj').textContent = now.toLocaleTimeString();
  }
  setInterval(updateClock, 1000);
  
  // Variables para la alarma
  let alarmaTime = null;
  let alarmaActiva = false;
  
  // Establecer alarma
  function setAlarma() {
    const input = document.getElementById('horaAlarma').value;
    if (input) {
      alarmaTime = input;
      alarmaActiva = true;
      alert(`Alarma establecida para las ${alarmaTime}`);
      checkAlarma();
    }
  }
  
  // Cancelar alarma
  function clearAlarma() {
    alarmaActiva = false;
    alarmaTime = null;
    alert('Alarma cancelada');
  }
  
  // Comprobar si es hora de la alarma
  function checkAlarma() {
    if (!alarmaActiva) return;
  
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
  
    if (currentTime === alarmaTime) {
      alarmaActiva = false;
      triggerAlarma();
    }
  }
  setInterval(checkAlarma, 1000);
  
  // Disparar alarma
  function triggerAlarma() {
    const audio = new Audio('alarma.mp3');
    audio.play();
  
    if (Notification.permission === 'granted') {
      new Notification('¡Es hora de despertar!');
    } else {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          new Notification('¡Es hora de despertar!');
        }
      });
    }
  }
  
  // Registrar Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => console.log('Service Worker registrado'))
      .catch(err => console.error('Error al registrar SW:', err));
  }

  let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('Evento beforeinstallprompt capturado');
  showInstallButton();
});

function showInstallButton() {
  const installButton = document.createElement('button');
  installButton.textContent = 'Instalar Despertador';
  installButton.style.position = 'fixed';
  installButton.style.bottom = '10px';
  installButton.style.right = '10px';
  installButton.style.backgroundColor = '#444';
  installButton.style.color = '#e0e0e0';
  installButton.style.border = 'none';
  installButton.style.padding = '8px 16px';
  installButton.style.cursor = 'pointer';
  installButton.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Usuario aceptó instalar la PWA');
        } else {
          console.log('Usuario rechazó instalar la PWA');
        }
        deferredPrompt = null;
      });
    }
  });
  document.body.appendChild(installButton);
}