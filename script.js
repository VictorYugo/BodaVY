// Countdown
const weddingDate = new Date('2026-10-08T17:00:00-05:00');
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

// Musica
const music = document.getElementById("music");
const playBtn = document.getElementById("playBtn");
const playIcon = playBtn.querySelector(".play-icon");

let processingMusic = false;

playBtn.addEventListener("click", async () => {
  if (processingMusic) {
    return;
  }

  processingMusic = true;
  playBtn.disabled = true;

  try {
    if (music.paused) {
      await music.play();
      playIcon.textContent = "❚❚";
      playBtn.setAttribute("aria-label", "Pausar");
      playBtn.setAttribute("aria-pressed", "true");
      playBtn.classList.add("playing");
    } else {
      music.pause();
      playIcon.textContent = "▶";
      playBtn.setAttribute("aria-label", "Reproducir");
      playBtn.setAttribute("aria-pressed", "false");
      playBtn.classList.remove("playing");
    }
  } catch (error) {
    console.error("Error al reproducir:", error);
    console.error("Ruta del audio:", music.currentSrc);
    console.error("Estado:", music.readyState);
    console.error("MediaError:", music.error);

    alert("No fue posible reproducir la música.");
  } finally {
    processingMusic = false;
    playBtn.disabled = false;
  }
});

// ======================================================
// Invitación personalizada mediante parámetros de URL
// ======================================================

const urlParams = new URLSearchParams(window.location.search);

const nombreParam = urlParams.get("nombre");
const cuposParam = urlParams.get("cupos");
const codigoParam = urlParams.get("id");

const saludoInvitado = document.getElementById("saludoInvitado");
const mensajeCupos = document.getElementById("mensajeCupos");

const rsvpForm = document.getElementById("rsvpForm");
const nombreInvitado = document.getElementById("nombreInvitado");
const asistencia = document.getElementById("asistencia");
const numeroInvitados = document.getElementById("numeroInvitados");
const contenedorCantidad = document.getElementById("contenedorCantidad");
const codigoInvitado = document.getElementById("codigoInvitado");
const cuposPermitidos = document.getElementById("cuposPermitidos");

const submitBtn = document.getElementById("submitBtn");
const formMessage = document.getElementById("formMessage");

// Convierte el parámetro cupos a número.
// Si no existe o no es válido, se usa 1.
const maxCupos = Number.parseInt(cuposParam, 10);
const cuposValidos =
  Number.isInteger(maxCupos) && maxCupos > 0 ? maxCupos : 1;


// ======================================================
// Personalización de la invitación
// ======================================================

if (nombreParam) {
  if (saludoInvitado) {
    saludoInvitado.textContent =
      `${nombreParam} Nos hace mucha ilusión compartir este día contigo.`;
  }

  nombreInvitado.value = nombreParam;

  // Evita modificaciones accidentales.
  nombreInvitado.readOnly = true;
}

codigoInvitado.value = codigoParam || "SIN-CODIGO";
cuposPermitidos.value = cuposValidos;

numeroInvitados.max = cuposValidos;
numeroInvitados.value = 1;

if (mensajeCupos) {
  mensajeCupos.textContent =
    cuposValidos === 1
      ? "Esta invitación ha sido reservada para 1 persona."
      : `Esta invitación ha sido reservada para un máximo de ${cuposValidos} personas.`;
}


// ======================================================
// Mostrar u ocultar el número de asistentes
// ======================================================

function actualizarCampoAsistentes() {
  const asistira = asistencia.value === "Sí, asistiré";

  if (asistira) {
    contenedorCantidad.hidden = false;
    numeroInvitados.disabled = false;
    numeroInvitados.required = true;

    if (!numeroInvitados.value || Number(numeroInvitados.value) < 1) {
      numeroInvitados.value = 1;
    }
  } else {
    contenedorCantidad.hidden = true;
    numeroInvitados.required = false;
    numeroInvitados.disabled = true;
  }
}

asistencia.addEventListener("change", actualizarCampoAsistentes);

// Inicialmente no se muestra hasta que seleccione que asistirá.
actualizarCampoAsistentes();


// ======================================================
// Validación del formulario
// ======================================================

function validarFormulario() {
  formMessage.textContent = "";
  formMessage.classList.remove("success", "error");

  if (!nombreInvitado.value.trim()) {
    mostrarMensaje("Ingresa el nombre del invitado.", "error");
    nombreInvitado.focus();
    return false;
  }

  if (!asistencia.value) {
    mostrarMensaje("Indica si podrás asistir.", "error");
    asistencia.focus();
    return false;
  }

  if (asistencia.value === "Sí, asistiré") {
    const cantidad = Number.parseInt(numeroInvitados.value, 10);

    if (!Number.isInteger(cantidad) || cantidad < 1) {
      mostrarMensaje(
        "Indica cuántas personas asistirán.",
        "error"
      );
      numeroInvitados.focus();
      return false;
    }

    if (cantidad > cuposValidos) {
      mostrarMensaje(
        `Esta invitación permite un máximo de ${cuposValidos} persona(s).`,
        "error"
      );
      numeroInvitados.focus();
      return false;
    }
  }

  return true;
}


// ======================================================
// Envío a Formspree sin salir de la página
// ======================================================

let enviandoFormulario = false;

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (enviandoFormulario || !validarFormulario()) {
    return;
  }

  enviandoFormulario = true;
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  formMessage.textContent = "";
  formMessage.classList.remove("success", "error");

  try {
    const formData = new FormData(rsvpForm);

    // Cuando la persona no asistirá, enviamos 0.
    if (asistencia.value === "No podré asistir") {
      formData.set("numero_personas", "0");
    }

    const response = await fetch(rsvpForm.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      let errorMessage = "No se pudo enviar la confirmación.";

      try {
        const result = await response.json();

        if (result.errors && result.errors.length > 0) {
          errorMessage = result.errors
            .map((item) => item.message)
            .join(" ");
        }
      } catch (jsonError) {
        console.error("Respuesta no válida:", jsonError);
      }

      throw new Error(errorMessage);
    }

    mostrarMensaje(
      asistencia.value === "Sí, asistiré"
        ? "¡Gracias! Hemos recibido tu confirmación. Nos encantará contar contigo."
        : "Gracias por avisarnos. Hemos registrado tu respuesta.",
      "success"
    );

    // Conserva los datos personalizados, pero limpia el resto.
    const nombreOriginal = nombreInvitado.value;
    const codigoOriginal = codigoInvitado.value;

    rsvpForm.reset();

    nombreInvitado.value = nombreOriginal;
    codigoInvitado.value = codigoOriginal;
    cuposPermitidos.value = cuposValidos;
    numeroInvitados.max = cuposValidos;

    actualizarCampoAsistentes();

  } catch (error) {
    console.error("Error al enviar el formulario:", error);

    mostrarMensaje(
      error.message ||
        "No se pudo enviar la confirmación. Inténtalo nuevamente.",
      "error"
    );

  } finally {
    enviandoFormulario = false;
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar confirmación";
  }
});


// ======================================================
// Mensajes visuales
// ======================================================

function mostrarMensaje(texto, tipo) {
  formMessage.textContent = texto;
  formMessage.classList.remove("success", "error");
  formMessage.classList.add(tipo);
}