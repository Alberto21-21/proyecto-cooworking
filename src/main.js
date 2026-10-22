const tareas = [];
let siguienteId = 1;
let idEditando = null;

const inputTitulo = document.getElementById("titulo");
const inputDescripcion = document.getElementById("descripcion");
const inputFecha = document.getElementById("fecha");
const botonCrear = document.getElementById("boton-crear");
const mensajeError = document.getElementById("error");
const lista = document.getElementById("listaTareas");

//Creo la tarea y la guardo en el array
const crearTarea = (titulo, descripcion, fechaLimite) => {
  const tarea = {
    id: siguienteId,
    titulo: titulo,
    descripcion: descripcion,
    fechaLimite: fechaLimite,
    estado: "pendiente",
  };

  tareas.push(tarea);
  siguienteId = siguienteId + 1;
};

// Busca la tarea por su id y cambia sus datos
const editarTarea = (id, titulo, descripcion, fechaLimite) => {
  for (let i = 0; i < tareas.length; i++) {
    if (tareas[i].id === id) {
      tareas[i].titulo = titulo;
      tareas[i].descripcion = descripcion;
      tareas[i].fechaLimite = fechaLimite;
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
      idEditando = id;
      botonCrear.textContent = "Guardar cambios";
    }
  }
};

// NUEVO: busca la tarea por su id y la quita del array
const eliminarTarea = (id) => {
  for (let i = 0; i < tareas.length; i++) {
    if (tareas[i].id === id) {
      // splice(posición, cuántos) borra elementos del array
      tareas.splice(i, 1);
      break; // ya la hemos borrado, dejamos de buscar
    }
  }

  // NUEVO: si borramos la tarea que estábamos editando, cancelamos la edición
  if (idEditando === id) {
    idEditando = null;
    botonCrear.textContent = "Crear tarea";
    inputTitulo.value = "";
    inputDescripcion.value = "";
    inputFecha.value = "";
  }
};

const mostrarTareas = () => {
  lista.innerHTML = "";

  for (let i = 0; i < tareas.length; i++) {
    const tarea = tareas[i];
    const item = document.createElement("li");

    let fecha = "sin fecha";
    if (tarea.fechaLimite !== "") {
      fecha = tarea.fechaLimite;
    }

    item.textContent =
      tarea.id + " - " + tarea.titulo + " | " + fecha + " | " + tarea.estado + " ";

    // Botón Editar de cada tarea
    const botonEditar = document.createElement("button");
    botonEditar.textContent = "Editar";
    botonEditar.addEventListener("click", () => {
      empezarEdicion(tarea.id);
    });

    // NUEVO: botón Eliminar de cada tarea
    const botonEliminar = document.createElement("button");
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", () => {
      eliminarTarea(tarea.id);
      mostrarTareas(); // volvemos a pintar la lista sin la tarea borrada
    });

    item.appendChild(botonEditar);
    item.appendChild(botonEliminar);
    lista.appendChild(item);
  }

  mostrarResumen();
};

botonCrear.addEventListener("click", () => {
  const titulo = inputTitulo.value.trim();

  if (titulo === "") {
    mensajeError.textContent = "El Titulo no puede estar vacío";
    return;
  }

  if (idEditando === null) {
    crearTarea(titulo, inputDescripcion.value, inputFecha.value);
  } else {
    editarTarea(idEditando, titulo, inputDescripcion.value, inputFecha.value);
    idEditando = null;
    botonCrear.textContent = "Crear tarea";
  }

  mensajeError.textContent = "";
  inputTitulo.value = "";
  inputDescripcion.value = "";
  inputFecha.value = "";

  mostrarTareas();
});

// ---------- Cambiar entre Inicio y Mis Tareas ----------
const vistaInicio = document.getElementById("vista-inicio");
const vistaTareas = document.getElementById("vista-tareas");
const enlacesMenu = document.querySelectorAll(".menu a[data-vista]");
const botonesVista = document.querySelectorAll("[data-vista]");
const listaResumen = document.getElementById("listaResumen");

// Enseña una vista y esconde la otra, y marca el enlace activo de la barra
const mostrarVista = (nombre) => {
  if (nombre === "tareas") {
    vistaInicio.classList.add("oculto");
    vistaTareas.classList.remove("oculto");
  } else {
    vistaTareas.classList.add("oculto");
    vistaInicio.classList.remove("oculto");
  }

  for (let i = 0; i < enlacesMenu.length; i++) {
    if (enlacesMenu[i].dataset.vista === nombre) {
      enlacesMenu[i].classList.add("activo");
    } else {
      enlacesMenu[i].classList.remove("activo");
    }
  }
};

// Cada elemento con data-vista (enlaces de la barra, "Ver todas", "+ Nueva Tarea")
// cambia a la vista que indica
for (let i = 0; i < botonesVista.length; i++) {
  botonesVista[i].addEventListener("click", (evento) => {
    evento.preventDefault();
    mostrarVista(botonesVista[i].dataset.vista);
  });
}

// ---------- Resumen de tareas en Inicio (solo las 3 primeras) ----------
const mostrarResumen = () => {
  listaResumen.innerHTML = "";

  if (tareas.length === 0) {
    const vacio = document.createElement("li");
    vacio.textContent = "No hay tareas todavía.";
    listaResumen.appendChild(vacio);
    return;
  }

  for (let i = 0; i < tareas.length && i < 3; i++) {
    const item = document.createElement("li");
    item.className = "tarea";

    const titulo = document.createElement("span");
    titulo.className = "tarea-titulo";
    titulo.textContent = tareas[i].titulo;

    const etiquetaPrioridad = document.createElement("span");
    etiquetaPrioridad.className = "prioridad " + tareas[i].prioridad;
    etiquetaPrioridad.textContent = tareas[i].prioridad;

    item.appendChild(titulo);
    item.appendChild(etiquetaPrioridad);
    listaResumen.appendChild(item);
  }
};

// Al abrir la página, pintamos las tareas (así sale "No hay tareas todavía.")
mostrarTareas();
