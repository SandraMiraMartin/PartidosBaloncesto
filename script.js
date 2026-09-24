let jugadores = [];
const maxJugadores = 12;

// Elementos DOM
const modalOverlay = document.getElementById('modalOverlay');
const btnAbrirModal = document.getElementById('btnAbrirModal');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const formJugador = document.getElementById('formJugador');
const listaJugadores = document.getElementById('listaJugadores');
const contadorJugadores = document.getElementById('contadorJugadores');

// Mostrar / Ocultar Modal
btnAbrirModal.addEventListener('click', () => {
  modalOverlay.classList.remove('hidden');
});

btnCerrarModal.addEventListener('click', () => {
  modalOverlay.classList.add('hidden');
});

// Cerrar al hacer clic fuera de la ventana
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.add('hidden');
  }
});

// Enviar Formulario
formJugador.addEventListener('submit', (e) => {
  e.preventDefault();

  if (jugadores.length >= maxJugadores) return;

  const numero = document.getElementById('numeroJugador').value;
  const nombre = document.getElementById('nombreJugador').value;

  jugadores.push({ numero, nombre });

  formJugador.reset();
  modalOverlay.classList.add('hidden');
  renderizarJugadores();
});

// Actualizar Lista en Pantalla
function renderizarJugadores() {
  listaJugadores.innerHTML = '';

  jugadores.forEach((jugador, index) => {
    const li = document.createElement('li');
    li.className = 'item-jugador';
    li.innerHTML = `
      <div>
        <span class="badge-dorsal">#${jugador.numero}</span>
        <strong>${jugador.nombre}</strong>
      </div>
      <button class="btn-eliminar" onclick="eliminarJugador(${index})">Eliminar</button>
    `;
    listaJugadores.appendChild(li);
  });

  contadorJugadores.textContent = jugadores.length;

  if (jugadores.length >= maxJugadores) {
    btnAbrirModal.disabled = true;
    btnAbrirModal.textContent = 'Límite máximo alcanzado (12/12)';
  } else {
    btnAbrirModal.disabled = false;
    btnAbrirModal.textContent = '+ Añadir Jugadores / Jugadoras';
  }
}

// Eliminar Jugador
function eliminarJugador(index) {
  jugadores.splice(index, 1);
  renderizarJugadores();
}
