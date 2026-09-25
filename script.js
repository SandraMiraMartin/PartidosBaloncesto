// Variables de Estado Global
let plantilla = [];
let titulares = [];
let tiempoSegundosCuarto = 600; // 10 minutos (600s) por cuarto
let cuartoActual = 1;
let timerInterval = null;
let seleccionadosTemp = [];
let jugadoraACambiarIndex = null;

// Elementos HTML
const modalOverlay = document.getElementById('modalOverlay');
const modalInicialesOverlay = document.getElementById('modalInicialesOverlay');
const modalCambioOverlay = document.getElementById('modalCambioOverlay');
const modalResumenOverlay = document.getElementById('modalResumenOverlay');

const btnAbrirModal = document.getElementById('btnAbrirModal');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const btnCerrarIniciales = document.getElementById('btnCerrarIniciales');
const btnCerrarCambio = document.getElementById('btnCerrarCambio');
const btnCerrarResumen = document.getElementById('btnCerrarResumen');
const btnAceptarResumen = document.getElementById('btnAceptarResumen');

const formJugador = document.getElementById('formJugador');
const listaJugadores = document.getElementById('listaJugadores');
const contadorJugadores = document.getElementById('contadorJugadores');

const btnEmpezarPartido = document.getElementById('btnEmpezarPartido');
const contenedorCampo = document.getElementById('contenedorCampo');

const btnInicio = document.getElementById('btnInicio');
const btnPausa = document.getElementById('btnPausa');
const btnFin = document.getElementById('btnFin');
const cronometroDisplay = document.getElementById('cronometro');
const labelCuarto = document.getElementById('labelCuarto');

const listaSeleccionIniciales = document.getElementById('listaSeleccionIniciales');
const contadorSeleccionadas = document.getElementById('contadorSeleccionadas');
const btnConfirmarIniciales = document.getElementById('btnConfirmarIniciales');

const listaSuplentesDisponibles = document.getElementById('listaSuplentesDisponibles');
const textoCambiandoA = document.getElementById('textoCambiandoA');
const listaResumenJugadoras = document.getElementById('listaResumenJugadoras');

// Gestores de Modales
btnAbrirModal.addEventListener('click', () => modalOverlay.classList.remove('hidden'));
btnCerrarModal.addEventListener('click', () => modalOverlay.classList.add('hidden'));
btnCerrarIniciales.addEventListener('click', () => modalInicialesOverlay.classList.add('hidden'));
btnCerrarCambio.addEventListener('click', () => modalCambioOverlay.classList.add('hidden'));
btnCerrarResumen.addEventListener('click', () => modalResumenOverlay.classList.add('hidden'));
btnAceptarResumen.addEventListener('click', () => modalResumenOverlay.classList.add('hidden'));

// Registrar Jugadora
formJugador.addEventListener('submit', (e) => {
  e.preventDefault();
  if (plantilla.length >= 12) return;

  const numero = document.getElementById('numeroJugador').value;
  const nombre = document.getElementById('nombreJugador').value;

  // Añadimos la propiedad tiempoSegundosJugados = 0
  plantilla.push({ id: Date.now(), numero, nombre, tiempoSegundosJugados: 0 });

  formJugador.reset();
  modalOverlay.classList.add('hidden');
  renderizarPlantilla();
});

// Renderizar Lista en Banquillo/Plantilla
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

// Ventana de Selección de Quinteto Inicial
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

// Confirmar 5 Titulares e Iniciar Estado del Partido
btnConfirmarIniciales.addEventListener('click', () => {
  // Reiniciar tiempos al iniciar un partido nuevo
  plantilla.forEach(j => j.tiempoSegundosJugados = 0);
  cuartoActual = 1;
  tiempoSegundosCuarto = 600;
  
  titulares = plantilla.filter(j => seleccionadosTemp.includes(j.id));
  modalInicialesOverlay.classList.add('hidden');
  
  actualizarPantallaTiempo();
  renderizarCampo();
  btnInicio.disabled = false;
  btnEmpezarPartido.disabled = true;
});

// Renderizar Jugadoras en Pista
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

// Modal de Cambio
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

// Ejecutar Cambio (Se guarda el tiempo de la saliente y entra la nueva)
function realizarCambio(entrante) {
  titulares[jugadoraACambiarIndex] = entrante;
  renderizarCampo();
  modalCambioOverlay.classList.add('hidden');
}

// Formateador de segundos a mm:ss
function formatearTiempo(segundosTotales) {
  const min = String(Math.floor(segundosTotales / 60)).padStart(2, '0');
  const seg = String(segundosTotales % 60).padStart(2, '0');
  return `${min}:${seg}`;
}

function actualizarPantallaTiempo() {
  cronometroDisplay.textContent = formatearTiempo(tiempoSegundosCuarto);
  labelCuarto.textContent = `Q${cuartoActual} - 10:00`;
}

// Control del Tiempo
btnInicio.addEventListener('click', () => {
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    if (tiempoSegundosCuarto > 0) {
      tiempoSegundosCuarto--;
      
      // Sumar 1 segundo a las 5 jugadoras que están actualmente en pista
      titulares.forEach(titular => {
        titular.tiempoSegundosJugados++;
      });

      cronometroDisplay.textContent = formatearTiempo(tiempoSegundosCuarto);
    } else {
      // Fin del cuarto
      clearInterval(timerInterval);
      timerInterval = null;

      if (cuartoActual < 4) {
        alert(`¡Fin del Cuarto ${cuartoActual}!`);
        cuartoActual++;
        tiempoSegundosCuarto = 600;
        actualizarPantallaTiempo();
        btnInicio.disabled = false;
        btnPausa.disabled = true;
      } else {
        alert('¡Fin del Partido!');
        finalizarPartido();
      }
    }
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
  if (confirm('¿Deseas finalizar el partido ahora?')) {
    finalizarPartido();
  }
});

// Finalizar Partido y Generar Modal de Resumen
function finalizarPartido() {
  clearInterval(timerInterval);
  timerInterval = null;

  // Generar resumen de minutos de cada jugadora
  listaResumenJugadoras.innerHTML = '';
  
  // Ordenar jugadoras por las que más jugaron
  const jugadorasOrdenadas = [...plantilla].sort((a, b) => b.tiempoSegundosJugados - a.tiempoSegundosJugados);

  jugadorasOrdenadas.forEach(j => {
    const div = document.createElement('div');
    div.className = 'item-resumen';
    div.innerHTML = `
      <div>
        <strong>#${j.numero} ${j.nombre}</strong>
      </div>
      <span class="tiempo-total">${formatearTiempo(j.tiempoSegundosJugados)} min</span>
    `;
    listaResumenJugadoras.appendChild(div);
  });

  // Mostrar modal de resumen
  modalResumenOverlay.classList.remove('hidden');

  // Resetear estados del tablero
  titulares = [];
  contenedorCampo.innerHTML = '<p class="empty-state">Partido finalizado. Selecciona un nuevo quinteto.</p>';
  btnInicio.disabled = true;
  btnPausa.disabled = true;
  btnFin.disabled = true;
  btnEmpezarPartido.disabled = plantilla.length < 5;
  
  cuartoActual = 1;
  tiempoSegundosCuarto = 600;
  actualizarPantallaTiempo();
}

//PDF
// Obtener el botón de descarga en el DOM
const btnDescargarPDF = document.getElementById('btnDescargarPDF');

// Función para exportar a PDF
btnDescargarPDF.addEventListener('click', () => {
  const elementoOriginal = document.getElementById('contenidoPDF');

  // Clonamos el elemento para modificar las propiedades sin alterar la vista en pantalla
  const clon = elementoOriginal.cloneNode(true);
  
  // Eliminamos el límite de altura y el scroll del contenedor interno en el clon
  const listaClonada = clon.querySelector('#listaResumenJugadoras');
  if (listaClonada) {
    listaClonada.style.maxHeight = 'none';
    listaClonada.style.overflow = 'visible';
  }

  // Opciones de exportación
  const opciones = {
    margin:       15,
    filename:     `Resumen_Partido_${new Date().toISOString().slice(0,10)}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, scrollY: 0 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Generar el PDF usando la copia modificada
  html2pdf().set(opciones).from(clon).save();
});