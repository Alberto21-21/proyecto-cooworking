const tareas = [];
let siguienteId = 1;
let idEditando = null; // NUEVO: guarda el id de la tarea que estamos editando (null = ninguna)

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

// NUEVO: busca la tarea por su id y cambia sus datos
const editarTarea = (id, titulo, descripcion, fechaLimite) => {
  for (let i = 0; i < tareas.length; i++) {
    if (tareas[i].id === id) {
      tareas[i].titulo = titulo;
      tareas[i].descripcion = descripcion;
      tareas[i].fechaLimite = fechaLimite;
    }
  }
};

// NUEVO: pasa los datos de la tarea a los inputs para poder cambiarlos
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

    // NUEVO: botón Editar de cada tarea
    const botonEditar = document.createElement("button");
    botonEditar.textContent = "Editar";
    botonEditar.addEventListener("click", () => {
      empezarEdicion(tarea.id);
    });

    item.appendChild(botonEditar);
    lista.appendChild(item);
  }
};

botonCrear.addEventListener("click", () => {
  const titulo = inputTitulo.value.trim();

  if (titulo === "") {
    mensajeError.textContent = "El Titulo no puede estar vacío";
    return;
  }

  // NUEVO: si estamos editando, guardamos los cambios; si no, creamos una tarea nueva
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