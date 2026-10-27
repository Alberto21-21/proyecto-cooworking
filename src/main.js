//carga el CSS, arranca cada pantalla y gestiona el menú
import "./style.css";
import { iniciarEventos } from "./eventos.js";
import { iniciarGastos } from "./gestionGastos.js";
import { iniciarTareas } from "./gestionTareas.js";
import { iniciarResumen } from "./resumen.js";

// Solo hay un index.html: enseñamos una vista y escondemos las demás
const VISTAS = ["inicio", "tareas", "calendario", "gastos"];

// sessionStorage: al recargar sigues en la misma vista; al cerrar la pestaña se olvida
const CLAVE_VISTA = "lifeos-vista";

const enlacesMenu = document.querySelectorAll(".menu a[data-vista]");

const mostrarVista = (nombre) => {
  if (!VISTAS.includes(nombre)) nombre = "inicio";

  for (const vista of VISTAS) {
    document.getElementById(`vista-${vista}`).classList.toggle("oculto", vista !== nombre);
  }
  for (const enlace of enlacesMenu) {
    enlace.classList.toggle("activo", enlace.dataset.vista === nombre);
  }

  sessionStorage.setItem(CLAVE_VISTA, nombre);
  window.scrollTo(0, 0);
};

iniciarResumen();
iniciarTareas();
iniciarEventos();
iniciarGastos();

// Un solo listener para todo lo que tenga data-vista (menú, "Ver todas", botones de Inicio...)
document.addEventListener("click", (evento) => {
  const enlace = evento.target.closest("[data-vista]");
  if (!enlace) return;

  evento.preventDefault();
  mostrarVista(enlace.dataset.vista);
});

mostrarVista(sessionStorage.getItem(CLAVE_VISTA));
