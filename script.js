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
// Invitación personalizada mediante código de URL
// ======================================================

const urlParams = new URLSearchParams(window.location.search);
const codigoParam = (urlParams.get("c") || "").trim().toUpperCase();
let invitado = null;

const saludoInvitado = document.getElementById("saludoInvitado");
const mensajeCupos = document.getElementById("mensajeCupos");
const giftIntro = document.getElementById("giftIntro");
const giftDetails = document.getElementById("giftDetails");

const rsvpForm = document.getElementById("rsvpForm");
const nombreInvitado = document.getElementById("nombreInvitado");
const asistencia = document.getElementById("asistencia");
const numeroInvitados = document.getElementById("numeroInvitados");
const contenedorCantidad = document.getElementById("contenedorCantidad");
const codigoInvitado = document.getElementById("codigoInvitado");
const cuposPermitidos = document.getElementById("cuposPermitidos");

const submitBtn = document.getElementById("submitBtn");
const formMessage = document.getElementById("formMessage");

let cuposValidos = 0;


// ======================================================
// Personalización de la invitación
// ======================================================

function renderGiftDetails() {
  if (!giftIntro || !giftDetails) {
    return;
  }

  const defaultGiftText = "El mejor regalo que pueden darnos es su presencia en nuestro día más importante pero, si desean tener un detalle con nosotros, un aporte a nuestro nuevo comienzo será enormemente apreciado.";
  giftIntro.textContent = defaultGiftText;

  const mostrarPagos = invitado && String(invitado.qr || "").trim().toUpperCase() === "X";
  giftDetails.innerHTML = "";

  if (!mostrarPagos || !Array.isArray(invitado.pagos) || invitado.pagos.length === 0) {
    return;
  }

  const items = invitado.pagos.map((pago) => {
    const qrSrc = pago.qr || (
      pago.nombre && pago.nombre.toLowerCase().includes("yessica")
        ? "assets/icons/QR_YYRP.png"
        : "assets/icons/QR_VHSN.png"
    );
    const persona = pago.nombre || "Cuenta del novios";
    const numeroCuenta = pago.numeroCuenta || "Nro cuenta: 123456789";
    const cci = pago.cci || "CCI: 987654321";
    const yape = pago.yape || "Yape: 999888777";

    return `
      <div class="payment-card">
        <div class="account-info top">
          <strong>${persona}</strong>
        </div>
        <div class="qr-box">
          <img src="${qrSrc}" alt="Código QR para ${persona}">
        </div>
        <div class="account-info bottom">
          <span><strong>Nro cuenta:</strong> <strong>${numeroCuenta.replace(/^Nro cuenta:\s*/i, "")}</strong></span>
          <span><strong>CCI:</strong> <strong>${cci.replace(/^CCI:\s*/i, "")}</strong></span>
          <span><strong>Yape:</strong> <strong>${yape.replace(/^Yape:\s*/i, "")}</strong></span>
        </div>
      </div>
    `;
  }).join("");

  giftDetails.innerHTML = `<div class="payment-grid">${items}</div>`;
}

function mostrarEnlaceInvalido() {
  if (mensajeCupos) {
    mensajeCupos.textContent = "Enlace de invitación no válido.";
  }

  if (giftIntro) {
    giftIntro.textContent = "El mejor regalo que pueden darnos es su presencia en nuestro día más importante pero, si desean tener un detalle con nosotros, un aporte a nuestro nuevo comienzo será enormemente apreciado.";
  }

  if (giftDetails) {
    giftDetails.innerHTML = "";
  }

  formMessage.textContent = "Verifica el código de tu invitación para confirmar tu asistencia.";
  formMessage.classList.add("error");
  rsvpForm.querySelectorAll("input, select, textarea, button").forEach((element) => {
    element.disabled = true;
  });
}

async function cargarInvitado() {
  try {
    const response = await fetch("invitados.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`No se pudo cargar invitados.json (${response.status}).`);
    }

    const listaInvitados = await response.json();
    invitado = listaInvitados[codigoParam];

    if (!invitado) {
      mostrarEnlaceInvalido();
      return;
    }

    cuposValidos = Number.isInteger(invitado.cupos) && invitado.cupos > 0
      ? invitado.cupos
      : 0;

    if (!cuposValidos) {
      mostrarEnlaceInvalido();
      return;
    }

    if (saludoInvitado) {
      saludoInvitado.textContent =
        `${invitado.nombre} Nos hace mucha ilusión compartir este día contigo.`;
    }

    nombreInvitado.value = invitado.nombre;
    nombreInvitado.readOnly = true;
    codigoInvitado.value = codigoParam;
    cuposPermitidos.value = cuposValidos;
    numeroInvitados.max = cuposValidos;
    numeroInvitados.value = 1;

    if (mensajeCupos) {
      mensajeCupos.textContent =
        cuposValidos === 1
          ? "Esta invitación ha sido reservada para 1 persona."
          : `Esta invitación ha sido reservada para un máximo de ${cuposValidos} personas.`;
    }

    renderGiftDetails();
  } catch (error) {
    console.error("Error al cargar invitados.json:", error);
    mostrarEnlaceInvalido();
  }
}

cargarInvitado();


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

  if (!invitado) {
    mostrarMensaje("El enlace de invitación no es válido.", "error");
    return false;
  }

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