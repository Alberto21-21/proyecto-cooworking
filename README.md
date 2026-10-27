// Guardar y leer de localStorage. localStorage solo guarda texto, así que usamos JSON.

export const guardar = (clave, datos) => {
  localStorage.setItem(clave, JSON.stringify(datos));
};

export const borrar = (clave) => {
  localStorage.removeItem(clave);
};

// Lee una lista con cuidado: si los datos están mal, no rompemos la aplicación
// esValido comprueba cada elemento y reconstruir crea la instancia de la clase
export const cargarLista = (clave, esValido, reconstruir) => {
  const texto = localStorage.getItem(clave);
  if (texto === null) return [];

  try {
    const datos = JSON.parse(texto);
    if (!Array.isArray(datos) || !datos.every((dato) => esValido(dato))) {
      throw new Error("los datos no tienen el formato esperado");
    }
    return datos.map((dato) => reconstruir(dato));
  } catch (error) {
    console.error(`No se ha podido cargar "${clave}":`, error);
    return [];
  }
};

// Igual que cargarLista pero para un solo objeto. Devuelve null si no hay nada válido
export const cargarObjeto = (clave, esValido, reconstruir) => {
  const texto = localStorage.getItem(clave);
  if (texto === null) return null;

  try {
    const dato = JSON.parse(texto);
    if (!esValido(dato)) {
      throw new Error("los datos no tienen el formato esperado");
    }
    return reconstruir(dato);
  } catch (error) {
    console.error(`No se ha podido cargar "${clave}":`, error);
    return null;
  }
};