// añadir, eliminar y ver el total del mes por categoría
import { CATEGORIAS } from "./categorias.js";
import {
  avisarCambio, cargarLista, crearBoton, crearElemento, crearItemVacio, fechaHoy, formatearEuros,
  formatearFecha, guardarLista, leerFormulario, mesActual, siguienteId, validarFormulario,
} from "./utilidades.js";

const CLAVE = "lifeos-gastos";

export const gastos = cargarLista(CLAVE);

const formulario = document.getElementById("form-gasto");
const campos = formulario.elements;
const mensajeError = document.getElementById("error-gasto");
const lista = document.getElementById("lista-gastos");
const totalMes = document.getElementById("total-gastos-mes");
const listaCategorias = document.getElementById("lista-categorias");

// Suma los importes de una lista de gastos
export const sumar = (lista) => lista.reduce((suma, gasto) => suma + gasto.importe, 0);

// Gastos del mes actual (la fecha empieza por "AAAA-MM")
export const gastosDelMes = () => gastos.filter((gasto) => gasto.fecha.startsWith(mesActual()));

const guardarGastos = () => {
  guardarLista(CLAVE, gastos);
  avisarCambio();
};

const crearGasto = (datos) => {
  gastos.push({
    id: siguienteId(gastos),
    concepto: datos.concepto.trim(),
    // Del formulario llega texto; lo pasamos a número y redondeamos a céntimos
    importe: Math.round(Number(datos.importe) * 100) / 100,
    categoria: datos.categoria,
    fecha: datos.fecha,
  });
  guardarGastos();
};

const eliminarGasto = (id) => {
  const posicion = gastos.findIndex((g) => g.id === id);
  if (posicion === -1) return;
  gastos.splice(posicion, 1);
  guardarGastos();
};

// Pantalla

const limpiarFormulario = () => {
  formulario.reset();
  campos.fecha.value = fechaHoy();
  mensajeError.textContent = "";
};

// Presenta el concepto, la categoría, la fecha y la acción de borrar.
const crearItemGasto = (gasto) => {
  const item = crearElemento("li", "tarea");
  item.dataset.id = gasto.id;

  const textos = crearElemento("div", "tarea-textos");
  textos.append(
    crearElemento("span", "tarea-titulo", gasto.concepto),
    crearElemento("small", "suave", `${CATEGORIAS[gasto.categoria]} · ${formatearFecha(gasto.fecha)}`),
  );

  item.append(
    textos,
    crearElemento("strong", "", formatearEuros(gasto.importe)),
    crearBoton("Eliminar", "boton-pequeno boton-eliminar", "eliminar"),
  );
  return item;
};

// Actualiza el historial, el total mensual y el desglose por categoría.
const pintarGastos = () => {
  // Los más recientes primero
  const ordenados = [...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);

  lista.replaceChildren();
  if (ordenados.length === 0) {
    lista.append(crearItemVacio("No hay gastos todavía."));
  }
  for (const gasto of ordenados) {
    lista.append(crearItemGasto(gasto));
  }

  const delMes = gastosDelMes();
  totalMes.textContent = formatearEuros(sumar(delMes));

  // Total por categoría este mes
  listaCategorias.replaceChildren();
  for (const categoria of Object.keys(CATEGORIAS)) {
    const total = sumar(delMes.filter((gasto) => gasto.categoria === categoria));
    if (total === 0) continue;

    const item = crearElemento("li", "fila-categoria");
    item.append(crearElemento("span", "", CATEGORIAS[categoria]), crearElemento("strong", "", formatearEuros(total)));
    listaCategorias.append(item);
  }
  if (listaCategorias.children.length === 0) {
    listaCategorias.append(crearItemVacio("Sin gastos este mes."));
  }
};

export const iniciarGastos = () => {
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarFormulario(formulario, mensajeError)) return;

    const datos = leerFormulario(formulario);
    if (datos.concepto.trim() === "") {
      mensajeError.textContent = "El concepto no puede estar vacío";
      return;
    }
    if (!(Number(datos.importe) > 0)) {
      mensajeError.textContent = "El importe tiene que ser mayor que 0";
      return;
    }

    crearGasto(datos);
    limpiarFormulario();
  });

  lista.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion='eliminar']");
    if (!boton) return;
    eliminarGasto(Number(boton.closest("li").dataset.id));
  });

  document.addEventListener("datos-cambiados", pintarGastos);

  limpiarFormulario();
  pintarGastos();
};
