/**
 * PlataClara - Control de gastos personales
 * Lógica principal: navegación, persistencia, validación y renderizado.
 */

// =========================
// Configuración y utilidades
// =========================
const STORAGE_KEY = 'plataclara_gastos';
const CATEGORIAS = ['Comida', 'Transporte', 'Estudio', 'Ocio', 'Otros'];
const COLORES_CATEGORIA = {
  Comida: 'var(--cat-comida)',
  Transporte: 'var(--cat-transporte)',
  Estudio: 'var(--cat-estudio)',
  Ocio: 'var(--cat-ocio)',
  Otros: 'var(--cat-otros)'
};

// Formateador de moneda en pesos colombianos
const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

function formatearPesos(valor) {
  const numero = Number(valor) || 0;
  // Asegura el formato "$ 25.000" solicitado
  return formatoCOP.format(numero).replace(/\u00A0/g, ' ');
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return 'Sin fecha';
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function fechaHoyISO() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function generarId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'g_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
}

function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// =========================
// Datos y persistencia
// =========================
let gastos = [];
let filtroCategoria = 'Todas';

function obtenerGastosEjemplo() {
  // Fechas relativas al mes actual para que el resumen tenga sentido
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const diaActual = hoy.getDate();
  const dia = (d) => String(Math.min(d, diaActual)).padStart(2, '0');

  return [
    { id: generarId(), monto: 25000, categoria: 'Comida', fecha: `${anio}-${mes}-${dia(2)}`, descripcion: 'Almuerzo ejecutivo' },
    { id: generarId(), monto: 12000, categoria: 'Transporte', fecha: `${anio}-${mes}-${dia(5)}`, descripcion: 'Recarga tarjeta de bus' },
    { id: generarId(), monto: 45000, categoria: 'Estudio', fecha: `${anio}-${mes}-${dia(8)}`, descripcion: 'Libro de programación' },
    { id: generarId(), monto: 30000, categoria: 'Ocio', fecha: `${anio}-${mes}-${dia(12)}`, descripcion: 'Salida al cine' },
    { id: generarId(), monto: 18500, categoria: 'Otros', fecha: `${anio}-${mes}-${dia(15)}`, descripcion: 'Artículos de papelería' }
  ];
}

function cargarGastos() {
  const guardados = localStorage.getItem(STORAGE_KEY);
  if (guardados === null) {
    // Primera visita: cargar datos de ejemplo
    gastos = obtenerGastosEjemplo();
    guardarGastos();
    return;
  }

  try {
    const parsed = JSON.parse(guardados);
    gastos = Array.isArray(parsed) ? parsed.filter(esGastoValido) : [];
  } catch {
    gastos = [];
  }
}

function esGastoValido(g) {
  return g && typeof g === 'object'
    && typeof g.monto === 'number' && g.monto > 0
    && typeof g.categoria === 'string'
    && typeof g.fecha === 'string'
    && typeof g.descripcion === 'string';
}

function guardarGastos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gastos));
}

function agregarGasto(datos) {
  const gasto = {
    id: generarId(),
    monto: datos.monto,
    categoria: datos.categoria,
    fecha: datos.fecha,
    descripcion: datos.descripcion
  };
  gastos.push(gasto);
  guardarGastos();
  return gasto;
}

function eliminarGasto(id) {
  gastos = gastos.filter(g => g.id !== id);
  guardarGastos();
}

// =========================
// Referencias del DOM
// =========================
const vistas = {
  inicio: document.getElementById('vista-inicio'),
  agregar: document.getElementById('vista-agregar'),
  resumen: document.getElementById('vista-resumen')
};

const inicioTotal = document.getElementById('inicio-total');
const inicioCantidad = document.getElementById('inicio-cantidad');
const btnIrAgregar = document.getElementById('btn-ir-agregar');
const btnIrResumen = document.getElementById('btn-ir-resumen');

const formGasto = document.getElementById('form-gasto');
const inputMonto = document.getElementById('monto');
const inputCategoria = document.getElementById('categoria');
const inputFecha = document.getElementById('fecha');
const inputDescripcion = document.getElementById('descripcion');
const errorMonto = document.getElementById('error-monto');
const errorFecha = document.getElementById('error-fecha');
const btnCancelarAgregar = document.getElementById('btn-cancelar-agregar');
const btnCancelarForm = document.getElementById('btn-cancelar-form');

const resumenTotal = document.getElementById('resumen-total');
const resumenTotalEtiqueta = document.getElementById('resumen-total-etiqueta');
const filtroCategoriaSelect = document.getElementById('filtro-categoria');
const resumenContenido = document.getElementById('resumen-contenido');
const categoriasLista = document.getElementById('categorias-lista');
const gastosLista = document.getElementById('gastos-lista');
const btnBorrarTodos = document.getElementById('btn-borrar-todos');
const estadoVacio = document.getElementById('estado-vacio');
const btnVolverInicio = document.getElementById('btn-volver-inicio');
const btnVacioAgregar = document.getElementById('btn-vacio-agregar');

const toast = document.getElementById('toast');

// =========================
// Navegación entre vistas
// =========================
function mostrarVista(nombre) {
  Object.entries(vistas).forEach(([clave, seccion]) => {
    const activa = clave === nombre;
    seccion.classList.toggle('activa', activa);
    seccion.setAttribute('aria-hidden', String(!activa));
  });

  if (nombre === 'inicio') renderizarInicio();
  if (nombre === 'resumen') renderizarResumen();
  if (nombre === 'agregar') prepararFormulario();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =========================
// Renderizado: Inicio
// =========================
function obtenerGastosMesActual() {
  const hoy = new Date();
  const mes = hoy.getMonth();
  const anio = hoy.getFullYear();
  return gastos.filter(g => {
    const [a, m] = g.fecha.split('-').map(Number);
    return a === anio && (m - 1) === mes;
  });
}

function renderizarInicio() {
  const gastosMes = obtenerGastosMesActual();
  const total = gastosMes.reduce((sum, g) => sum + g.monto, 0);
  inicioTotal.textContent = formatearPesos(total);
  inicioCantidad.textContent = String(gastosMes.length);
}

// =========================
// Renderizado: Resumen
// =========================
function aplicarFiltroCategoria(lista) {
  return filtroCategoria === 'Todas'
    ? lista
    : lista.filter(g => g.categoria === filtroCategoria);
}

function mensajeSinGastos() {
  return filtroCategoria === 'Todas'
    ? 'No hay gastos registrados este mes.'
    : `No hay gastos de ${escaparHTML(filtroCategoria)} este mes.`;
}

function renderizarResumen() {
  if (gastos.length === 0) {
    filtroCategoria = 'Todas';
    filtroCategoriaSelect.value = filtroCategoria;
    resumenContenido.classList.add('oculto');
    estadoVacio.classList.remove('oculto');
    resumenTotal.textContent = formatearPesos(0);
    resumenTotalEtiqueta.textContent = 'Total del mes';
    return;
  }

  resumenContenido.classList.remove('oculto');
  estadoVacio.classList.add('oculto');

  const gastosFiltrados = aplicarFiltroCategoria(obtenerGastosMesActual());
  const totalFiltrado = gastosFiltrados.reduce((sum, g) => sum + g.monto, 0);
  resumenTotal.textContent = formatearPesos(totalFiltrado);
  resumenTotalEtiqueta.textContent = filtroCategoria === 'Todas'
    ? 'Total del mes'
    : `Total de ${filtroCategoria}`;

  renderizarCategorias(gastosFiltrados, totalFiltrado);
  renderizarListaGastos(gastosFiltrados);
}

function renderizarCategorias(gastosFiltrados, totalFiltrado) {
  if (totalFiltrado === 0) {
    categoriasLista.innerHTML = `<p class="lista-vacia">${mensajeSinGastos()}</p>`;
    return;
  }

  // Calcular totales por categoría
  const totales = {};
  CATEGORIAS.forEach(cat => { totales[cat] = 0; });
  gastosFiltrados.forEach(g => {
    if (totales[g.categoria] !== undefined) {
      totales[g.categoria] += g.monto;
    }
  });

  const categoriasVisibles = filtroCategoria === 'Todas' ? CATEGORIAS : [filtroCategoria];
  categoriasLista.innerHTML = categoriasVisibles.map(cat => {
    const valor = totales[cat];
    const porcentaje = totalFiltrado > 0 ? (valor / totalFiltrado) * 100 : 0;
    const color = COLORES_CATEGORIA[cat];
    return `
      <div class="categoria-item">
        <div class="categoria-info">
          <span class="categoria-nombre">
            <span class="categoria-punto" style="background:${color}"></span>
            ${cat}
          </span>
          <span class="categoria-valor">${formatearPesos(valor)}</span>
        </div>
        <div class="barra-fondo" role="progressbar" aria-label="${cat}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(porcentaje)}">
          <div class="barra-relleno" style="width:${porcentaje}%; background:${color}"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderizarListaGastos(gastosFuente) {
  if (gastosFuente.length === 0) {
    gastosLista.innerHTML = `<p class="lista-vacia">${mensajeSinGastos()}</p>`;
    return;
  }

  // Ordenar del más reciente al más antiguo; si misma fecha, el más reciente agregado primero
  const conIndice = gastosFuente.map((g, i) => ({ ...g, _i: i }));
  conIndice.sort((a, b) => {
    const cmp = b.fecha.localeCompare(a.fecha);
    if (cmp !== 0) return cmp;
    return b._i - a._i;
  });

  gastosLista.innerHTML = conIndice.map(g => {
    const descripcion = g.descripcion.trim() || 'Sin descripción';
    const claseEtiqueta = 'etiqueta-' + g.categoria.toLowerCase();
    return `
      <article class="gasto-item">
        <div class="gasto-info">
          <div class="gasto-superior">
            <span class="gasto-descripcion" title="${escaparHTML(descripcion)}">${escaparHTML(descripcion)}</span>
            <span class="etiqueta-categoria ${claseEtiqueta}">${escaparHTML(g.categoria)}</span>
          </div>
          <div class="gasto-fecha">${formatearFecha(g.fecha)}</div>
        </div>
        <div class="gasto-derecha">
          <span class="gasto-monto">${formatearPesos(g.monto)}</span>
          <button class="btn-eliminar" data-id="${escaparHTML(g.id)}" aria-label="Eliminar gasto ${escaparHTML(descripcion)}" title="Eliminar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
            </svg>
          </button>
        </div>
      </article>
    `;
  }).join('');
}

// =========================
// Formulario: validación y envío
// =========================
function prepararFormulario() {
  formGasto.reset();
  limpiarErrores();
  inputFecha.value = fechaHoyISO();
  inputMonto.focus();
}

function limpiarErrores() {
  errorMonto.textContent = '';
  errorFecha.textContent = '';
  inputMonto.classList.remove('invalido');
  inputFecha.classList.remove('invalido');
}

function validarFormulario() {
  limpiarErrores();
  let valido = true;

  const montoRaw = inputMonto.value.trim();
  const monto = Number(montoRaw);
  if (!montoRaw || !Number.isFinite(monto) || monto <= 0) {
    errorMonto.textContent = 'Ingresa un monto mayor que cero.';
    inputMonto.classList.add('invalido');
    valido = false;
  }

  const fecha = inputFecha.value;
  if (!fecha) {
    errorFecha.textContent = 'Selecciona una fecha para el gasto.';
    inputFecha.classList.add('invalido');
    valido = false;
  }

  return { valido, monto: Math.round(monto), fecha };
}

function manejarEnvio(e) {
  e.preventDefault();
  const { valido, monto, fecha } = validarFormulario();
  if (!valido) {
    // Enfocar el primer campo con error
    if (inputMonto.classList.contains('invalido')) inputMonto.focus();
    else if (inputFecha.classList.contains('invalido')) inputFecha.focus();
    return;
  }

  agregarGasto({
    monto,
    categoria: inputCategoria.value,
    fecha,
    descripcion: inputDescripcion.value.trim()
  });

  mostrarToast('Gasto guardado correctamente');
  mostrarVista('inicio');
}

// =========================
// Eliminación de gastos
// =========================
function manejarClickLista(e) {
  const btn = e.target.closest('.btn-eliminar');
  if (!btn) return;
  const id = btn.dataset.id;
  const gasto = gastos.find(g => g.id === id);
  if (!gasto) return;

  const descripcion = gasto.descripcion.trim() || 'este gasto';
  const confirmado = window.confirm(`¿Quieres eliminar "${descripcion}"?`);
  if (!confirmado) return;

  eliminarGasto(id);
  renderizarResumen();
  mostrarToast('Gasto eliminado');
}

function borrarTodosLosGastos() {
  const cantidad = gastos.length;
  if (cantidad === 0) return;

  const mensaje = cantidad === 1
    ? '¿Borrar el gasto registrado? Esta acción no se puede deshacer.'
    : `¿Borrar los ${cantidad} gastos registrados? Esta acción no se puede deshacer.`;
  if (!window.confirm(mensaje)) return;

  gastos = [];
  guardarGastos();
  filtroCategoria = 'Todas';
  filtroCategoriaSelect.value = filtroCategoria;
  renderizarResumen();
  mostrarToast('Todos los gastos fueron borrados');
}

// =========================
// Toast / feedback
// =========================
let toastTimer;
function mostrarToast(mensaje) {
  toast.textContent = mensaje;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2600);
}

// =========================
// Eventos
// =========================
function inicializarEventos() {
  btnIrAgregar.addEventListener('click', () => mostrarVista('agregar'));
  btnIrResumen.addEventListener('click', () => mostrarVista('resumen'));
  btnCancelarAgregar.addEventListener('click', () => mostrarVista('inicio'));
  btnCancelarForm.addEventListener('click', () => mostrarVista('inicio'));
  btnVolverInicio.addEventListener('click', () => mostrarVista('inicio'));
  btnVacioAgregar.addEventListener('click', () => mostrarVista('agregar'));

  formGasto.addEventListener('submit', manejarEnvio);
  gastosLista.addEventListener('click', manejarClickLista);
  btnBorrarTodos.addEventListener('click', borrarTodosLosGastos);
  filtroCategoriaSelect.addEventListener('change', () => {
    filtroCategoria = filtroCategoriaSelect.value;
    renderizarResumen();
  });

  // Limpiar error al escribir/cambiar
  inputMonto.addEventListener('input', () => {
    if (inputMonto.value && Number(inputMonto.value) > 0) {
      errorMonto.textContent = '';
      inputMonto.classList.remove('invalido');
    }
  });
  inputFecha.addEventListener('change', () => {
    if (inputFecha.value) {
      errorFecha.textContent = '';
      inputFecha.classList.remove('invalido');
    }
  });
}

// =========================
// Inicialización
// =========================
function init() {
  cargarGastos();
  inicializarEventos();
  mostrarVista('inicio');
}

document.addEventListener('DOMContentLoaded', init);
