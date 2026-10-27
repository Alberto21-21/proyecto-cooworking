// crear, editar, eliminar, completar y filtrar
import { PRIORIDADES } from "./categorias.js";
import {
  avisarCambio, cargarLista, crearBoton, crearElemento, crearItemVacio, fechaHoy,
  formatearFecha, guardarLista, leerFormulario, siguienteId, validarFormulario,
} from "./utilidades.js";

const CLAVE = "lifeos-tareas";

// La lista de tareas. Otros archivos (resumen, eventos) la importan para leerla
export const tareas = cargarLista(CLAVE);

const formulario = document.getElementById("form-tarea");
const campos = formulario.elements;
const botonGuardar = document.getElementById("boton-crear");
const botonCancelar = document.getElementById("cancelar-tarea");
const mensajeError = document.getElementById("error-tarea");
const lista = document.getElementById("listaTareas");
const filtros = document.getElementById("filtros-tareas");

let idEditando = null;
let filtroActual = "todas";

// Una tarea pendiente cuya fecha límite ya pasó
export const estaVencida = (tarea) => !tarea.completada && tarea.fechaLimite !== "" && tarea.fechaLimite < fechaHoy();

// Primero las de prioridad alta y, a igual prioridad, la fecha más cercana
export const ordenarPorPrioridad = (lista) =>
  [...lista].sort((a, b) => {
    const diferencia = PRIORIDADES.indexOf(a.prioridad) - PRIORIDADES.indexOf(b.prioridad);
    if (diferencia !== 0) return diferencia;
    return (a.fechaLimite || "9999").localeCompare(b.fechaLimite || "9999");
  });

const guardarTareas = () => {
  guardarLista(CLAVE, tareas);
  avisarCambio();
};

const crearTarea = (datos) => {
  tareas.push({
    id: siguienteId(tareas),
    titulo: datos.titulo.trim(),
    descripcion: datos.descripcion.trim(),
    fechaLimite: datos.fechaLimite,
    prioridad: datos.prioridad,
    completada: false,
  });
  guardarTareas();
};

const editarTarea = (id, datos) => {
  const tarea = tareas.find((t) => t.id === id);
  if (!tarea) return;

  tarea.titulo = datos.titulo.trim();
  tarea.descripcion = datos.descripcion.trim();
  tarea.fechaLimite = datos.fechaLimite;
  tarea.prioridad = datos.prioridad;
  guardarTareas();
};

const eliminarTarea = (id) => {
  const posicion = tareas.findIndex((t) => t.id === id);
  if (posicion === -1) return;
  tareas.splice(posicion, 1);
  guardarTareas();
};

// Deja el formulario vacío y en modo "crear"
const limpiarFormulario = () => {
  formulario.reset();
  // No se pueden elegir días anteriores a hoy para una tarea nueva
  campos.fechaLimite.min = fechaHoy();
  idEditando = null;
  botonGuardar.textContent = "Crear tarea";
  botonCancelar.classList.add("oculto");
  mensajeError.textContent = "";
};

// Pasa los datos de la tarea a los inputs para poder cambiarlos
const empezarEdicion = (id) => {
  const tarea = tareas.find((t) => t.id === id);
  if (!tarea) return;

  campos.titulo.value = tarea.titulo;
  campos.descripcion.value = tarea.descripcion;
  campos.fechaLimite.value = tarea.fechaLimite;
  campos.prioridad.value = tarea.prioridad;
  // Una tarea antigua puede tener fecha pasada, así que al editar quitamos el mínimo
  campos.fechaLimite.min = "";

  idEditando = id;
  botonGuardar.textContent = "Guardar cambios";
  botonCancelar.classList.remove("oculto");
  mensajeError.textContent = "";
  campos.titulo.focus();
};



const tareasFiltradas = () => {
  if (filtroActual === "pendientes") return tareas.filter((t) => !t.completada);
  if (filtroActual === "completadas") return tareas.filter((t) => t.completada);
  return tareas;
};

const crearItemTarea = (tarea) => {
  const item = crearElemento("li", "tarea");
  item.dataset.id = tarea.id;
  item.classList.toggle("completada", tarea.completada);

  const casilla = document.createElement("input");
  casilla.type = "checkbox";
  casilla.checked = tarea.completada;
  casilla.setAttribute("aria-label", "Marcar como completada");

  const textos = crearElemento("div", "tarea-textos");
  textos.append(crearElemento("span", "tarea-titulo", tarea.titulo));
  if (tarea.descripcion !== "") {
    textos.append(crearElemento("small", "suave", tarea.descripcion));
  }

  const etiquetaPrioridad = crearElemento("span", `prioridad ${tarea.prioridad}`, tarea.prioridad);

  const textoFecha = tarea.fechaLimite === "" ? "sin fecha" : formatearFecha(tarea.fechaLimite);
  const etiquetaFecha = crearElemento("span", "etiqueta", textoFecha);
  etiquetaFecha.classList.toggle("vencida", estaVencida(tarea));

  const acciones = crearElemento("div", "acciones");
  acciones.append(
    crearBoton("Editar", "boton-pequeno boton-editar", "editar"),
    crearBoton("Eliminar", "boton-pequeno boton-eliminar", "eliminar"),
  );

  item.append(casilla, textos, etiquetaPrioridad, etiquetaFecha, acciones);
  return item;
};

const pintarTareas = () => {
  const visibles = tareasFiltradas();
  lista.replaceChildren();

  if (visibles.length === 0) {
    lista.append(crearItemVacio(tareas.length === 0 ? "No hay tareas todavía." : "No hay tareas en este filtro."));
    return;
  }

  for (const tarea of visibles) {
    lista.append(crearItemTarea(tarea));
  }
};


export const iniciarTareas = () => {
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarFormulario(formulario, mensajeError)) return;

    const datos = leerFormulario(formulario);
    // El navegador deja pasar un título hecho solo de espacios
    if (datos.titulo.trim() === "") {
      mensajeError.textContent = "El título no puede estar vacío";
      return;
    }

    if (idEditando === null) {
      crearTarea(datos);
    } else {
      editarTarea(idEditando, datos);
    }
    limpiarFormulario();
  });

  botonCancelar.addEventListener("click", limpiarFormulario);

  // Un solo listener en la lista para los botones de todas las tareas
  lista.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    // dataset siempre da texto, por eso lo pasamos a número
    const id = Number(boton.closest("li").dataset.id);

    if (boton.dataset.accion === "editar") {
      empezarEdicion(id);
    } else if (boton.dataset.accion === "eliminar") {
      eliminarTarea(id);
      // Si borramos la tarea que estábamos editando, cancelamos la edición
      if (idEditando === id) limpiarFormulario();
    }
  });

  // Marcar / desmarcar la casilla
  lista.addEventListener("change", (evento) => {
    if (!evento.target.matches("input[type='checkbox']")) return;

    const id = Number(evento.target.closest("li").dataset.id);
    const tarea = tareas.find((t) => t.id === id);
    tarea.completada = evento.target.checked;
    guardarTareas();
  });

  filtros.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-filtro]");
    if (!boton) return;

    filtroActual = boton.dataset.filtro;
    for (const otro of filtros.querySelectorAll("[data-filtro]")) {
      otro.classList.toggle("activo", otro === boton);
    }
    pintarTareas();
  });

  document.addEventListener("datos-cambiados", pintarTareas);

  limpiarFormulario();
  pintarTareas();
};
