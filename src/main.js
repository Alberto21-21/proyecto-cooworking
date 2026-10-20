const tareas = [];
let siguienteId = 1;

const inputTitulo = document.getElementById("titulo");
const inputDescripcion = document.getElementById("descripcion");
const inputFecha = document.getElementById("fecha");
const botonCrear = document.getElementById("botonCrear");
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

  //.push para añadirlo al array
  tareas.push(tarea);
  siguienteId = siguienteId + 1;
};

const mostrarTareas = () => {
  //para cambiar el contenido HTML o contenido de un elemento
  lista.innerHTML = "";

  for (let i = 0; i < tareas.length; i++) {
    const tarea = tareas[i];
    const item = document.createElement("li");

    let fecha = "sin fecha";
    if (tarea.fechaLimite !== "") {
      fecha = tarea.fechaLimite;
    }

    item.textContent =
      tarea.id + " - " + tarea.titulo + " | " + fecha + " | " + tarea.estado;
    lista.appendChild(item);
  }
};

botonCrear.addEventListener("click", () => {
  const titulo = inputTitulo.value.trim();

  if (titulo === "") {
    mensajeError.textContent = "El Titulo no puede estar vacío";
    return;
  }

  crearTarea(titulo, inputDescripcion.value, inputFecha.value);
  mensajeError.textContent = "";
  inputTitulo.value = "";
  inputDescripcion.value = "";
  inputFecha.value = "";

  mostrarTareas();
});