// estadísticas, próximo plan y las tareas más importantes
import { eventos, haTerminado, horario, ordenarEventos } from "./eventos.js";
import { gastosDelMes, sumar } from "./gestionGastos.js";
import { estaVencida, ordenarPorPrioridad, tareas } from "./gestionTareas.js";
import { TIPOS_EVENTO } from "./categorias.js";
import {
  aTextoFecha, capitalizar, crearCajaDia, crearElemento, crearItemVacio, fechaHoy, formatearEuros, formatearFecha,
} from "./utilidades.js";

const fechaCabecera = document.getElementById("fecha-hoy");
const estadisticaTareas = document.getElementById("stat-tareas");
const estadisticaEventos = document.getElementById("stat-eventos");
const estadisticaGasto = document.getElementById("stat-gasto");
const proximoEvento = document.getElementById("proximo-evento");
const listaResumen = document.getElementById("listaResumen");
const gastoMes = document.getElementById("gasto-mes");

// Lunes y domingo de esta semana en formato "AAAA-MM-DD"
const semanaActual = () => {
  const lunes = new Date();
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  return [aTextoFecha(lunes), aTextoFecha(domingo)];
};

const pintarCabecera = () => {
  fechaCabecera.textContent = capitalizar(formatearFecha(fechaHoy(), { weekday: "short", day: "numeric", month: "long" }));
};

const pintarEstadisticas = () => {
  const completadas = tareas.filter((t) => t.completada).length;
  estadisticaTareas.textContent = `${completadas} / ${tareas.length}`;

  const [lunes, domingo] = semanaActual();
  estadisticaEventos.textContent = eventos.filter((e) => e.fecha >= lunes && e.fecha <= domingo).length;

  const gastado = formatearEuros(sumar(gastosDelMes()));
  estadisticaGasto.textContent = gastado;
  gastoMes.textContent = gastado;
};

const pintarProximoEvento = () => {
  const [siguiente] = ordenarEventos(eventos.filter((e) => !haTerminado(e)));
  proximoEvento.replaceChildren();

  if (!siguiente) {
    proximoEvento.append(crearElemento("p", "suave", "No tienes planes próximos."));
    return;
  }

  const textoDia = siguiente.fecha === fechaHoy() ? "Hoy" : formatearFecha(siguiente.fecha, { weekday: "long" });
  const textos = crearElemento("div");
  textos.append(
    crearElemento("p", "evento-titulo", siguiente.titulo),
    crearElemento("small", "suave", `${TIPOS_EVENTO[siguiente.tipo]} · ${capitalizar(textoDia)} · ${horario(siguiente)}`),
  );

  const caja = crearElemento("div", "evento");
  caja.append(crearCajaDia(siguiente.fecha), textos);
  proximoEvento.append(caja);
};

// Las 3 tareas pendientes más importantes
const pintarResumenTareas = () => {
  const pendientes = ordenarPorPrioridad(tareas.filter((t) => !t.completada));
  listaResumen.replaceChildren();

  if (pendientes.length === 0) {
    listaResumen.append(crearItemVacio(tareas.length === 0 ? "No hay tareas todavía." : "¡No tienes tareas pendientes! 🎉"));
    return;
  }

  for (const tarea of pendientes.slice(0, 3)) {
    const item = crearElemento("li", "tarea");
    const etiquetaFecha = crearElemento("span", "etiqueta", tarea.fechaLimite === "" ? "sin fecha" : formatearFecha(tarea.fechaLimite));
    etiquetaFecha.classList.toggle("vencida", estaVencida(tarea));

    item.append(
      crearElemento("span", "tarea-titulo", tarea.titulo),
      etiquetaFecha,
      crearElemento("span", `prioridad ${tarea.prioridad}`, tarea.prioridad),
    );
    listaResumen.append(item);
  }
};

const pintarInicio = () => {
  pintarCabecera();
  pintarEstadisticas();
  pintarProximoEvento();
  pintarResumenTareas();
};

export const iniciarResumen = () => {
  // El resumen depende de todo, así que se repinta con cualquier cambio
  document.addEventListener("datos-cambiados", pintarInicio);
  pintarInicio();
};
