// Funciones pequeñas que usan varios archivos: fechas, dinero, DOM, formularios y localStorage

// ---------- Fechas ----------

// Date -> "AAAA-MM-DD" (el mismo formato que da un input type="date")
export const aTextoFecha = (fecha) => {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
};

// "AAAA-MM-DD" -> Date (hora local)
export const aFecha = (texto) => {
  const [anio, mes, dia] = texto.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
};

export const fechaHoy = () => aTextoFecha(new Date());

// "AAAA-MM" del mes actual
export const mesActual = () => fechaHoy().slice(0, 7);

// "AAAA-MM-DDTHH:MM" de ahora, se puede comparar como texto
export const ahoraTexto = () => {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  return `${fechaHoy()}T${horas}:${minutos}`;
};

export const formatearFecha = (texto, opciones = { day: "numeric", month: "short" }) =>
  aFecha(texto).toLocaleDateString("es-ES", opciones);

// "sábado" -> "Sábado"
export const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

const formatoEuros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
export const formatearEuros = (cantidad) => formatoEuros.format(cantidad);

// ---------- Crear elementos del DOM ----------

// Usamos textContent (no innerHTML) para que lo que escribe el usuario no se interprete como HTML
export const crearElemento = (etiqueta, clase = "", texto = "") => {
  const elemento = document.createElement(etiqueta);
  if (clase !== "") elemento.className = clase;
  if (texto !== "") elemento.textContent = texto;
  return elemento;
};

export const crearBoton = (texto, clase, accion) => {
  const boton = crearElemento("button", clase, texto);
  boton.type = "button";
  boton.dataset.accion = accion;
  return boton;
};

// <li> que sale cuando una lista está vacía
export const crearItemVacio = (texto) => crearElemento("li", "vacio", texto);

// Caja oscura con el mes y el día (OCT / 24)
export const crearCajaDia = (textoFecha) => {
  const fecha = aFecha(textoFecha);
  const caja = crearElemento("div", "dia-caja");
  const mes = fecha.toLocaleDateString("es-ES", { month: "short" }).replace(".", "").toUpperCase();
  caja.append(crearElemento("small", "", mes), crearElemento("strong", "", String(fecha.getDate())));
  return caja;
};

// ---------- Formularios ----------

const mensajeDeError = (campo) => {
  const nombre = campo.dataset.nombre ?? campo.name;
  const { validity } = campo;

  if (validity.valueMissing) return `${nombre} es obligatorio`;
  if (validity.typeMismatch) return `${nombre} no tiene un formato válido`;
  if (validity.rangeUnderflow) {
    return campo.type === "date" ? `${nombre} no puede ser anterior a hoy` : `${nombre} tiene que ser como mínimo ${campo.min}`;
  }
  if (validity.rangeOverflow) return `${nombre} tiene que ser como máximo ${campo.max}`;
  if (validity.stepMismatch) return `${nombre} solo admite dos decimales`;
  if (validity.tooLong) return `${nombre} es demasiado largo`;
  if (validity.badInput) return `${nombre} no es válido`;
  return campo.validationMessage;
};

// Devuelve true si todo está bien. Si no, escribe el primer error en la página y pone el foco en ese campo
export const validarFormulario = (formulario, mensajeError) => {
  for (const campo of formulario.elements) {
    if (campo.willValidate && !campo.checkValidity()) {
      mensajeError.textContent = mensajeDeError(campo);
      campo.focus();
      return false;
    }
  }
  mensajeError.textContent = "";
  return true;
};

// Convierte el formulario en un objeto { nombreCampo: valor }
export const leerFormulario = (formulario) => Object.fromEntries(new FormData(formulario));

// ---------- localStorage ----------

// localStorage solo guarda texto, por eso usamos JSON
export const guardarLista = (clave, lista) => {
  localStorage.setItem(clave, JSON.stringify(lista));
};

// Si los datos guardados están mal, devolvemos una lista vacía en vez de romper la página
export const cargarLista = (clave) => {
  try {
    const datos = JSON.parse(localStorage.getItem(clave));
    return Array.isArray(datos) ? datos : [];
  } catch (error) {
    return [];
  }
};

// Siguiente id libre de una lista
export const siguienteId = (lista) => lista.reduce((maximo, elemento) => Math.max(maximo, elemento.id), 0) + 1;

// Avisa a las demás pantallas de que los datos han cambiado (Inicio y Calendario se vuelven a pintar)
export const avisarCambio = () => document.dispatchEvent(new Event("datos-cambiados"));
