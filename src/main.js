const tareas = [];
let siguienteId = 1;
let idEditando = null;

const inputTitulo = document.getElementById("titulo");
const inputDescripcion = document.getElementById("descripcion");
const inputFecha = document.getElementById("fecha");
const inputPrioridad = document.getElementById("prioridad");
const botonCrear = document.getElementById("boton-crear");
const mensajeError = document.getElementById("error");
const lista = document.getElementById("listaTareas");

// Fecha de hoy en formato AAAA-MM-DD (el mismo que da el input de tipo date)
const hoy = new Date();
const anio = hoy.getFullYear();
const mes = String(hoy.getMonth() + 1).padStart(2, "0");
const dia = String(hoy.getDate()).padStart(2, "0");
const fechaHoy = anio + "-" + mes + "-" + dia;

// El calendario no deja elegir días anteriores a hoy
inputFecha.min = fechaHoy;

//Creo la tarea y la guardo en el array
const crearTarea = (titulo, descripcion, fechaLimite, prioridad) => {
  const tarea = {
    id: siguienteId,
    titulo: titulo,
    descripcion: descripcion,
    fechaLimite: fechaLimite,
    prioridad: prioridad,
    estado: "pendiente",
  };

  tareas.push(tarea);
  siguienteId = siguienteId + 1;
};

// Busca la tarea por su id y cambia sus datos
const editarTarea = (id, titulo, descripcion, fechaLimite, prioridad) => {
  for (let i = 0; i < tareas.length; i++) {
    if (tareas[i].id === id) {
      tareas[i].titulo = titulo;
      tareas[i].descripcion = descripcion;
      tareas[i].fechaLimite = fechaLimite;
      tareas[i].prioridad = prioridad;
    }
  }
};

// Pasa los datos de la tarea a los inputs para poder cambiarlos
const empezarEdicion = (id) => {
  for (let i = 0; i < tareas.length; i++) {
    if (tareas[i].id === id) {
      inputTitulo.value = tareas[i].titulo;
      inputDescripcion.value = tareas[i].descripcion;
      inputFecha.value = tareas[i].fechaLimite;
      inputPrioridad.value = tareas[i].prioridad;
      idEditando = id;
      botonCrear.textContent = "Guardar cambios";
    }
  }
};

// Busca la tarea por su id y la quita del array
const eliminarTarea = (id) => {
  for (let i = 0; i < tareas.length; i++) {
    if (tareas[i].id === id) {
      tareas.splice(i, 1);
      break;
    }
  }

  // Si borramos la tarea que estábamos editando, cancelamos la edición
  if (idEditando === id) {
    idEditando = null;
    botonCrear.textContent = "Crear tarea";
    inputTitulo.value = "";
    inputDescripcion.value = "";
    inputFecha.value = "";
    inputPrioridad.value = "media";
  }
};

const mostrarTareas = () => {
  lista.innerHTML = "";

  for (let i = 0; i < tareas.length; i++) {
    const tarea = tareas[i];
    const item = document.createElement("li");
    item.className = "tarea";

    let fecha = "sin fecha";
    if (tarea.fechaLimite !== "") {
      fecha = tarea.fechaLimite;
    }

    // Título de la tarea
    const titulo = document.createElement("span");
    titulo.className = "tarea-titulo";
    titulo.textContent = tarea.titulo;

    // Etiqueta con la prioridad
    const etiquetaPrioridad = document.createElement("span");
    etiquetaPrioridad.className = "prioridad " + tarea.prioridad;
    etiquetaPrioridad.textContent = tarea.prioridad;

    // Etiqueta con la fecha
    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta";
    etiqueta.textContent = fecha;

    // Los botones van juntos dentro de un div
    const acciones = document.createElement("div");
    acciones.className = "acciones";

    const botonEditar = document.createElement("button");
    botonEditar.textContent = "Editar";
    botonEditar.className = "boton-pequeno boton-editar";
    botonEditar.addEventListener("click", () => {
      empezarEdicion(tarea.id);
    });

    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.className = "boton-pequeno boton-eliminar";
    botonEliminar.addEventListener("click", () => {
      eliminarTarea(tarea.id);
      mostrarTareas();
    });

    acciones.appendChild(botonEditar);
    acciones.appendChild(botonEliminar);

    item.appendChild(titulo);
    item.appendChild(etiquetaPrioridad);
    item.appendChild(etiqueta);
    item.appendChild(acciones);
    lista.appendChild(item);
  }
};

botonCrear.addEventListener("click", () => {
  const titulo = inputTitulo.value.trim();

  if (titulo === "") {
    mensajeError.textContent = "El Titulo no puede estar vacío";
    return;
  }
  // Si hay fecha y es anterior a hoy, mostramos el error y paramos
   if (inputFecha.value !== "" && inputFecha.value < fechaHoy) {
    mensajeError.textContent = "La fecha no puede ser anterior a hoy";
    return;
  }
  if (idEditando === null) {
    crearTarea(titulo, inputDescripcion.value, inputFecha.value, inputPrioridad.value);
  } else {
    editarTarea(idEditando, titulo, inputDescripcion.value, inputFecha.value, inputPrioridad.value);
    idEditando = null;
    botonCrear.textContent = "Crear tarea";
  }

  mensajeError.textContent = "";
  inputTitulo.value = "";
  inputDescripcion.value = "";
  inputFecha.value = "";
  inputPrioridad.value = "media";

  mostrarTareas();
});