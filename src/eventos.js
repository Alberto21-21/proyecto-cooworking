// Pantalla "Calendario": planes y exámenes (crear, editar, eliminar) y rejilla del mes
import { TIPOS_EVENTO } from "./categorias.js";
import { tareas } from "./gestionTareas.js";
import {
  ahoraTexto, aTextoFecha, avisarCambio, capitalizar, cargarLista, crearBoton, crearCajaDia, crearElemento,
  crearItemVacio, fechaHoy, formatearFecha, guardarLista, leerFormulario, siguienteId, validarFormulario,
} from "./utilidades.js";

const CLAVE = "lifeos-eventos";

export const eventos = cargarLista(CLAVE);

const tituloMes = document.getElementById("titulo-mes");
const botonMesAnterior = document.getElementById("mes-anterior");
const botonMesSiguiente = document.getElementById("mes-siguiente");
const botonHoy = document.getElementById("mes-hoy");
const diasCalendario = document.getElementById("dias-calendario");
const tituloDia = document.getElementById("titulo-dia");
const listaDia = document.getElementById("lista-dia");
const listaProximos = document.getElementById("lista-proximos");
const botonNuevoPlan = document.getElementById("nuevo-plan");
const botonCrearPlanInicio = document.getElementById("boton-crear-plan");

const dialogo = document.getElementById("dialogo-evento");
const formulario = document.getElementById("form-evento");
const campos = formulario.elements;
const tituloDialogo = document.getElementById("titulo-dialogo-evento");
const mensajeError = document.getElementById("error-evento");
const botonCancelar = document.getElementById("cancelar-evento");

// Estado de esta pantalla (no hace falta guardarlo)
let mesVisible = new Date();
mesVisible.setDate(1);
let diaSeleccionado = fechaHoy();
let idEditando = null;

// ---------- Datos ----------

// Texto para enseñar: "21:00 - 23:30", "21:00" o "Todo el día"
export const horario = (evento) => {
  if (evento.horaInicio === "") return "Todo el día";
  if (evento.horaFin === "") return evento.horaInicio;
  return `${evento.horaInicio} - ${evento.horaFin}`;
};

// ¿Ya ha pasado? Comparamos el momento en que acaba con el momento actual
export const haTerminado = (evento) => {
  const fin = `${evento.fecha}T${evento.horaFin || evento.horaInicio || "23:59"}`;
  return fin < ahoraTexto();
};

// Por fecha y hora; los de "todo el día" van primero
export const ordenarEventos = (lista) =>
  [...lista].sort((a, b) => (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio));

const guardarEventos = () => {
  guardarLista(CLAVE, eventos);
  avisarCambio();
};

const crearEvento = (datos) => {
  eventos.push({
    id: siguienteId(eventos),
    titulo: datos.titulo.trim(),
    fecha: datos.fecha,
    horaInicio: datos.horaInicio,
    horaFin: datos.horaFin,
    lugar: datos.lugar.trim(),
    tipo: datos.tipo,
  });
  guardarEventos();
};

const editarEvento = (id, datos) => {
  const evento = eventos.find((e) => e.id === id);
  if (!evento) return;

  evento.titulo = datos.titulo.trim();
  evento.fecha = datos.fecha;
  evento.horaInicio = datos.horaInicio;
  evento.horaFin = datos.horaFin;
  evento.lugar = datos.lugar.trim();
  evento.tipo = datos.tipo;
  guardarEventos();
};

const eliminarEvento = (id) => {
  const posicion = eventos.findIndex((e) => e.id === id);
  if (posicion === -1) return;
  eventos.splice(posicion, 1);
  guardarEventos();
};

// { "2026-10-24": 2, ... } cuántos elementos hay cada día
const contarPorDia = (lista, campoFecha) =>
  lista.reduce((cuenta, elemento) => {
    const fecha = elemento[campoFecha];
    if (fecha !== "") cuenta[fecha] = (cuenta[fecha] ?? 0) + 1;
    return cuenta;
  }, {});

// ---------- Rejilla del mes ----------

const pintarMes = () => {
  const anio = mesVisible.getFullYear();
  const mes = mesVisible.getMonth();

  tituloMes.textContent = capitalizar(mesVisible.toLocaleDateString("es-ES", { month: "long", year: "numeric" }));

  const planesPorDia = contarPorDia(eventos.filter((e) => e.tipo === "plan"), "fecha");
  const examenesPorDia = contarPorDia(eventos.filter((e) => e.tipo === "examen"), "fecha");
  const tareasPorDia = contarPorDia(tareas.filter((t) => !t.completada), "fechaLimite");

  diasCalendario.replaceChildren();

  // getDay() da 0 para domingo; queremos que la semana empiece en lunes
  const huecos = (new Date(anio, mes, 1).getDay() + 6) % 7;
  for (let i = 0; i < huecos; i++) {
    diasCalendario.append(crearElemento("div", "dia vacio"));
  }

  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  const hoy = fechaHoy();

  for (let dia = 1; dia <= diasDelMes; dia++) {
    const fecha = aTextoFecha(new Date(anio, mes, dia));
    const boton = crearElemento("button", "dia");
    boton.type = "button";
    boton.dataset.fecha = fecha;
    boton.classList.toggle("hoy", fecha === hoy);
    boton.classList.toggle("seleccionado", fecha === diaSeleccionado);

    const marcas = crearElemento("div", "marcas");
    if (planesPorDia[fecha]) marcas.append(crearElemento("span", "marca plan", String(planesPorDia[fecha])));
    if (examenesPorDia[fecha]) marcas.append(crearElemento("span", "marca examen", String(examenesPorDia[fecha])));
    if (tareasPorDia[fecha]) marcas.append(crearElemento("span", "marca tarea", String(tareasPorDia[fecha])));

    boton.append(crearElemento("span", "numero-dia", String(dia)), marcas);
    diasCalendario.append(boton);
  }
};

// ---------- Lo que hay el día seleccionado ----------

const crearItemEvento = (evento) => {
  const item = crearElemento("li", "tarea");
  item.dataset.id = evento.id;

  const textos = crearElemento("div", "tarea-textos");
  textos.append(crearElemento("span", "tarea-titulo", evento.titulo));
  const detalle = evento.lugar === "" ? horario(evento) : `${horario(evento)} · ${evento.lugar}`;
  textos.append(crearElemento("small", "suave", detalle));

  const acciones = crearElemento("div", "acciones");
  acciones.append(
    crearBoton("Editar", "boton-pequeno boton-editar", "editar"),
    crearBoton("Eliminar", "boton-pequeno boton-eliminar", "eliminar"),
  );

  item.append(crearElemento("span", `tipo ${evento.tipo}`, TIPOS_EVENTO[evento.tipo]), textos, acciones);
  return item;
};

const crearItemTareaDelDia = (tarea) => {
  const item = crearElemento("li", "tarea");
  item.classList.toggle("completada", tarea.completada);
  item.append(
    crearElemento("span", "tipo tarea", "✅ Tarea"),
    crearElemento("span", "tarea-titulo", tarea.titulo),
    crearElemento("span", `prioridad ${tarea.prioridad}`, tarea.prioridad),
  );
  return item;
};

const pintarDia = () => {
  tituloDia.textContent = capitalizar(formatearFecha(diaSeleccionado, { weekday: "long", day: "numeric", month: "long" }));

  const delDia = ordenarEventos(eventos.filter((e) => e.fecha === diaSeleccionado));
  const tareasDelDia = tareas.filter((t) => t.fechaLimite === diaSeleccionado);

  listaDia.replaceChildren();
  if (delDia.length === 0 && tareasDelDia.length === 0) {
    listaDia.append(crearItemVacio("Nada para este día."));
    return;
  }

  for (const evento of delDia) listaDia.append(crearItemEvento(evento));
  for (const tarea of tareasDelDia) listaDia.append(crearItemTareaDelDia(tarea));
};

const pintarProximos = () => {
  const proximos = ordenarEventos(eventos.filter((e) => !haTerminado(e))).slice(0, 5);

  listaProximos.replaceChildren();
  if (proximos.length === 0) {
    listaProximos.append(crearItemVacio("No tienes planes ni exámenes próximos."));
    return;
  }

  for (const evento of proximos) {
    const item = crearElemento("li", "evento");
    // Al pulsar un próximo evento, el calendario salta a ese día
    item.dataset.fecha = evento.fecha;

    const textos = crearElemento("div");
    textos.append(
      crearElemento("p", "evento-titulo", `${evento.tipo === "examen" ? "📝 " : ""}${evento.titulo}`),
      crearElemento("small", "suave", horario(evento)),
    );
    item.append(crearCajaDia(evento.fecha), textos);
    listaProximos.append(item);
  }
};

const pintarCalendario = () => {
  pintarMes();
  pintarDia();
  pintarProximos();
};

const seleccionarDia = (fecha) => {
  diaSeleccionado = fecha;
  mesVisible = new Date(Number(fecha.slice(0, 4)), Number(fecha.slice(5, 7)) - 1, 1);
  pintarCalendario();
};

const cambiarMes = (desplazamiento) => {
  mesVisible = new Date(mesVisible.getFullYear(), mesVisible.getMonth() + desplazamiento, 1);
  pintarMes();
};

// ---------- Ventana para crear / editar ----------

const abrirDialogo = (evento = null) => {
  formulario.reset();
  campos.horaFin.setCustomValidity("");
  mensajeError.textContent = "";
  idEditando = evento ? evento.id : null;

  if (evento) {
    tituloDialogo.textContent = "Editar";
    campos.tipo.value = evento.tipo;
    campos.titulo.value = evento.titulo;
    campos.fecha.value = evento.fecha;
    campos.horaInicio.value = evento.horaInicio;
    campos.horaFin.value = evento.horaFin;
    campos.lugar.value = evento.lugar;
  } else {
    tituloDialogo.textContent = "Nuevo plan o examen";
    campos.fecha.value = diaSeleccionado;
  }

  dialogo.showModal();
  campos.titulo.focus();
};

// La hora de fin no puede ser antes que la de inicio (error propio con setCustomValidity)
const comprobarHoras = () => {
  const { horaInicio, horaFin } = campos;
  const mal = horaInicio.value !== "" && horaFin.value !== "" && horaFin.value < horaInicio.value;
  horaFin.setCustomValidity(mal ? "La hora de fin no puede ser anterior a la de inicio" : "");
};

export const iniciarEventos = () => {
  botonMesAnterior.addEventListener("click", () => cambiarMes(-1));
  botonMesSiguiente.addEventListener("click", () => cambiarMes(1));
  botonHoy.addEventListener("click", () => seleccionarDia(fechaHoy()));

  diasCalendario.addEventListener("click", (evento) => {
    const dia = evento.target.closest("[data-fecha]");
    if (dia) seleccionarDia(dia.dataset.fecha);
  });

  listaProximos.addEventListener("click", (evento) => {
    const item = evento.target.closest("[data-fecha]");
    if (item) seleccionarDia(item.dataset.fecha);
  });

  listaDia.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;

    const id = Number(boton.closest("li").dataset.id);
    if (boton.dataset.accion === "editar") {
      abrirDialogo(eventos.find((e) => e.id === id));
    } else if (boton.dataset.accion === "eliminar" && confirm("¿Seguro que quieres eliminarlo?")) {
      eliminarEvento(id);
    }
  });

  botonNuevoPlan.addEventListener("click", () => abrirDialogo());
  // El botón "Crear Plan" de Inicio también cambia de vista (lo hace main.js)
  botonCrearPlanInicio.addEventListener("click", () => abrirDialogo());
  botonCancelar.addEventListener("click", () => dialogo.close());

  campos.horaInicio.addEventListener("input", comprobarHoras);
  campos.horaFin.addEventListener("input", comprobarHoras);

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    comprobarHoras();
    if (!validarFormulario(formulario, mensajeError)) return;

    const datos = leerFormulario(formulario);
    if (datos.titulo.trim() === "") {
      mensajeError.textContent = "El título no puede estar vacío";
      return;
    }

    if (idEditando === null) {
      crearEvento(datos);
    } else {
      editarEvento(idEditando, datos);
    }
    dialogo.close();
    // Llevamos el calendario al día del plan para ver el cambio
    seleccionarDia(datos.fecha);
  });

  // Si cambian los planes o las tareas, se vuelve a pintar el calendario
  document.addEventListener("datos-cambiados", pintarCalendario);

  pintarCalendario();
};
