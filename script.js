// Variables de Estado Global
let plantilla = [];
let titulares = [];
let tiempoSegundos = 0;
let timerInterval = null;
let seleccionadosTemp = [];
let jugadoraACambiarIndex = null;

// Elementos HTML
const modalOverlay = document.getElementById('modalOverlay');
const modalInicialesOverlay = document.getElementById('modalInicialesOverlay');
const modalCambioOverlay = document.getElementById('modalCambioOverlay');

const btnAbrirModal = document.getElementById('btnAbrirModal');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const btnCerrarIniciales = document.getElementById('btnCerrarIniciales');
const btnCerrarCambio = document.getElementById('btnCerrarCambio');

const formJugador = document.getElementById('formJugador');
const listaJugadores = document.getElementById('listaJugadores');
const contadorJugadores = document.getElementById('contadorJugadores');

const btnEmpezarPartido = document.getElementById('btnEmpezarPartido');
const contenedorCampo = document.getElementById('contenedorCampo');

const btnInicio = document.getElementById('btnInicio');
const btnPausa = document.getElementById('btnPausa');
const btnFin = document.getElementById('btnFin');
const cronometroDisplay = document.getElementById('cronometro');

const listaSeleccionIniciales = document.getElementById('listaSeleccionIniciales');
const contadorSeleccionadas = document.getElementById('contadorSeleccionadas');
const btnConfirmarIniciales = document.getElementById('btnConfirmarIniciales');

const listaSuplentesDisponibles = document.getElementById('listaSuplentesDisponibles');
const textoCambiandoA = document.getElementById('textoCambiandoA');

// Abrir y Cerrar Ventanas Emergentes
btnAbrirModal.addEventListener('click', () => modalOverlay.classList.remove('hidden'));
btnCerrarModal.addEventListener('click', () => modalOverlay.classList.add('hidden'));
btnCerrarIniciales.addEventListener('click', () => modalInicialesOverlay.classList.add('hidden'));
btnCerrarCambio.addEventListener('click', () => modalCambioOverlay.classList.add('hidden'));

// Registro de Jugadora
formJugador.addEventListener('submit', (e) => {
  e.preventDefault();
  if (plantilla.length >= 12) return;

  const numero = document.getElementById('numeroJugador').value;
  const nombre = document.getElementById('nombreJugador').value;

  plantilla.push({ id: Date.now(), numero, nombre });

  formJugador.reset();
  modalOverlay.classList.add('hidden');
  renderizarPlantilla();
});

// Renderizado de Plantilla (Izquierda)
function renderizarPlantilla() {
  listaJugadores.innerHTML = '';

  plantilla.forEach((jugadora, index) => {
    const li = document.createElement('li');
    li.className = 'item-jugador';
    li.innerHTML = `
      <div>
        <strong>#${jugadora.numero} ${jugadora.nombre}</strong>
      </div>
      <button class="btn-eliminar" onclick="eliminarJugadora(${index})">Eliminar</button>
    `;
    listaJugadores.appendChild(li);
  });

  contadorJugadores.textContent = plantilla.length;
  btnEmpezarPartido.disabled = plantilla.length < 5;
}

function eliminarJugadora(index) {
  plantilla.splice(index, 1);
  renderizarPlantilla();
}

// Abrir Modal para Selección de 5 Iniciales
btnEmpezarPartido.addEventListener('click', () => {
  seleccionadosTemp = [];
  contadorSeleccionadas.textContent = 0;
  btnConfirmarIniciales.disabled = true;
  
  listaSeleccionIniciales.innerHTML = '';
  plantilla.forEach(jugadora => {
    const div = document.createElement('div');
    div.className = 'item-check';
    div.innerHTML = `
      <input type="checkbox" value="${jugadora.id}" onchange="toggleSeleccionInicial(this, ${jugadora.id})">
      <span>#${jugadora.numero} - ${jugadora.nombre}</span>
    `;
    listaSeleccionIniciales.appendChild(div);
  });

  modalInicialesOverlay.classList.remove('hidden');
});

function toggleSeleccionInicial(checkbox, id) {
  if (checkbox.checked) {
    if (seleccionadosTemp.length >= 5) {
      checkbox.checked = false;
      return;
    }
    seleccionadosTemp.push(id);
  } else {
    seleccionadosTemp = seleccionadosTemp.filter(item => item !== id);
  }

  contadorSeleccionadas.textContent = seleccionadosTemp.length;
  btnConfirmarIniciales.disabled = seleccionadosTemp.length !== 5;
}

// Confirmar Iniciales y Pasar a Cancha
btnConfirmarIniciales.addEventListener('click', () => {
  titulares = plantilla.filter(j => seleccionadosTemp.includes(j.id));
  modalInicialesOverlay.classList.add('hidden');
  
  renderizarCampo();
  btnInicio.disabled = false;
  btnEmpezarPartido.disabled = true;
});

// Renderizar Jugadoras en la Cancha (Derecha)
function renderizarCampo() {
  contenedorCampo.innerHTML = '';

  titulares.forEach((jugadora, index) => {
    const div = document.createElement('div');
    div.className = 'item-jugador';
    div.innerHTML = `
      <div>
        <strong>#${jugadora.numero} ${jugadora.nombre}</strong>
      </div>
      <button class="btn-cambio" onclick="abrirModalCambio(${index})">Cambio</button>
    `;
    contenedorCampo.appendChild(div);
  });
}

// Proceso de Cambio de Jugadoras
function abrirModalCambio(indexTitular) {
  jugadoraACambiarIndex = indexTitular;
  const saliente = titulares[indexTitular];
  
  textoCambiandoA.textContent = `Sustituir a #${saliente.numero} ${saliente.nombre}`;
  
  const titularesIds = titulares.map(t => t.id);
  const suplentes = plantilla.filter(j => !titularesIds.includes(j.id));

  listaSuplentesDisponibles.innerHTML = '';
  
  if (suplentes.length === 0) {
    listaSuplentesDisponibles.innerHTML = '<p>No hay suplentes en el banquillo.</p>';
  } else {
    suplentes.forEach(suplente => {
      const div = document.createElement('div');
      div.className = 'item-check';
      div.innerHTML = `<span>#${suplente.numero} - ${suplente.nombre}</span>`;
      div.onclick = () => realizarCambio(suplente);
      listaSuplentesDisponibles.appendChild(div);
    });
  }

  modalCambioOverlay.classList.remove('hidden');
}

function realizarCambio(entrante) {
  titulares[jugadoraACambiarIndex] = entrante;
  renderizarCampo();
  modalCambioOverlay.classList.add('hidden');
}

// Cronómetro de Partido
btnInicio.addEventListener('click', () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    tiempoSegundos++;
    const min = String(Math.floor(tiempoSegundos / 60)).padStart(2, '0');
    const seg = String(tiempoSegundos % 60).padStart(2, '0');
    cronometroDisplay.textContent = `${min}:${seg}`;
  }, 1000);

  btnInicio.disabled = true;
  btnPausa.disabled = false;
  btnFin.disabled = false;
});

btnPausa.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  btnInicio.disabled = false;
  btnPausa.disabled = true;
});

btnFin.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  tiempoSegundos = 0;
  cronometroDisplay.textContent = "00:00";

  titulares = [];
  contenedorCampo.innerHTML = '<p class="empty-state">Partido finalizado. Selecciona un nuevo quinteto.</p>';

  btnInicio.disabled = true;
  btnPausa.disabled = true;
  btnFin.disabled = true;
  btnEmpezarPartido.disabled = plantilla.length < 5;
});