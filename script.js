// Variables for the alarm
let alarmaTime = null;
let alarmaActiva = false;
let deferredPrompt = null;

// Update clock in real time
function updateClock() {
  const now = new Date();
  document.getElementById('reloj').textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock(); // Initial call to avoid delay

// Set alarm
function setAlarma() {
  const input = document.getElementById('horaAlarma').value;
  if (input) {
    alarmaTime = input;
    alarmaActiva = true;
    alert(`Alarma establecida para las ${alarmaTime}`);
    checkAlarma();
  }
}

// Cancel alarm
function clearAlarma() {
  alarmaActiva = false;
  alarmaTime = null;
  document.getElementById('horaAlarma').value = '';
  alert('Alarma cancelada');
}

// Check if it's time for the alarm
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

// Trigger alarm
function triggerAlarma() {
  const audio = new Audio('alarma.mp3');
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
  });

  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('¡Es hora de despertar!');
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('¡Es hora de despertar!');
        }
      });
    }
  }
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado correctamente:', registration.scope);
      })
      .catch(error => {
        console.error('Error al registrar Service Worker:', error);
      });
  });
}

// Handle PWA installation
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Store the event so it can be triggered later
  deferredPrompt = e;
  console.log('Evento beforeinstallprompt capturado');
  
  // Show the install button
  showInstallButton();
});

function showInstallButton() {
  // Check if the button already exists
  if (document.querySelector('.install-btn')) return;
  
  const installButton = document.createElement('button');
  installButton.textContent = 'Instalar Despertador';
  installButton.className = 'install-btn';
  
  installButton.addEventListener('click', () => {
    if (!deferredPrompt) {
      console.log('No hay prompt de instalación disponible');
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuario aceptó instalar la PWA');
      } else {
        console.log('Usuario rechazó instalar la PWA');
      }
      // We've used the prompt, and can't use it again, throw it away
      deferredPrompt = null;
      
      // Remove the button after user makes a choice
      installButton.remove();
    });
  });
  
  document.body.appendChild(installButton);
  console.log('Botón de instalación mostrado');
}

// Log when the app is installed
window.addEventListener('appinstalled', (evt) => {
  console.log('Aplicación instalada correctamente');
});

// Debug logs for PWA installation
console.log('¿Está en modo standalone?', window.matchMedia('(display-mode: standalone)').matches);
console.log('¿Service Worker soportado?', 'serviceWorker' in navigator);