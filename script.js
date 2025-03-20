// Añade estos logs al inicio del archivo
console.log('Verificando estado de PWA:');
console.log('- URL actual:', window.location.href);
console.log('- ¿Está en modo standalone?', window.matchMedia('(display-mode: standalone)').matches);
console.log('- ¿Service Worker soportado?', 'serviceWorker' in navigator);
console.log('- ¿Notificaciones soportadas?', 'Notification' in window);

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

// Mejora el manejo del evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Store the event so it can be triggered later
  deferredPrompt = e;
  console.log('✅ Evento beforeinstallprompt capturado');
  console.log('Detalles del evento:', e);
  
  // Show the install button
  showInstallButton();
});

// Mejora la función showInstallButton para forzar la visualización del botón
function showInstallButton() {
  console.log('Intentando mostrar el botón de instalación...');
  
  // Eliminar botón existente si hay alguno
  const existingButton = document.querySelector('.install-btn');
  if (existingButton) {
    existingButton.remove();
    console.log('Botón existente eliminado');
  }
  
  const installButton = document.createElement('button');
  installButton.textContent = 'Instalar DreamPeace';
  installButton.className = 'install-btn';
  installButton.style.position = 'fixed';
  installButton.style.bottom = '20px';
  installButton.style.right = '20px';
  installButton.style.backgroundColor = '#444';
  installButton.style.color = '#e0e0e0';
  installButton.style.border = 'none';
  installButton.style.padding = '10px 16px';
  installButton.style.borderRadius = '4px';
  installButton.style.cursor = 'pointer';
  installButton.style.zIndex = '9999'; // Asegura que esté por encima de todo
  
  installButton.addEventListener('click', () => {
    console.log('Botón de instalación clickeado');
    if (!deferredPrompt) {
      console.log('❌ No hay prompt de instalación disponible');
      alert('No se puede instalar la aplicación en este momento. Asegúrate de que no esté ya instalada.');
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    console.log('Prompt de instalación mostrado al usuario');
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Usuario aceptó instalar la PWA');
      } else {
        console.log('❌ Usuario rechazó instalar la PWA');
      }
      // We've used the prompt, and can't use it again, throw it away
      deferredPrompt = null;
      
      // Remove the button after user makes a choice
      installButton.remove();
    });
  });
  
  document.body.appendChild(installButton);
  console.log('✅ Botón de instalación añadido al DOM');
}

// Añade un botón de instalación manual para forzar la prueba




// Log when the app is installed
window.addEventListener('appinstalled', (evt) => {
  console.log('Aplicación instalada correctamente');
});

// Debug logs for PWA installation
console.log('¿Está en modo standalone?', window.matchMedia('(display-mode: standalone)').matches);
console.log('¿Service Worker soportado?', 'serviceWorker' in navigator);