let db
const request = indexedDB.open("EscuelaBaileDB", 3)

request.onupgradeneeded = e => {
  db = e.target.result
  if (!db.objectStoreNames.contains("alumnos"))
    db.createObjectStore("alumnos", { keyPath: "id", autoIncrement: true })
  if (!db.objectStoreNames.contains("clases"))
    db.createObjectStore("clases", { keyPath: "id", autoIncrement: true })
  if (!db.objectStoreNames.contains("emparejamientos"))
    db.createObjectStore("emparejamientos", { keyPath: "id", autoIncrement: true })
}

request.onsuccess = e => {
  db = e.target.result
  cargarAlumnos()
  cargarClases()
  cargarEmparejamientos()
}

request.onerror = () => alert("Error al abrir la base de datos")

const formAlumno = document.getElementById("form-alumno")
const listaAlumnos = document.getElementById("lista-alumnos")
const formClase = document.getElementById("form-clase")
const listaClases = document.getElementById("lista-clases")
const selectAlumno = document.getElementById("select-alumno")
const selectClase = document.getElementById("select-clase")
const listaEmparejamientos = document.getElementById("lista-emparejamientos")
const formEmparejar = document.getElementById("form-emparejar")
const btnLimpiarEmp = document.getElementById("limpiar-emparejamientos")

formAlumno.addEventListener("submit", e => {
  e.preventDefault()
  const nombre = document.getElementById("nombre-alumno").value.trim()
  const edad = document.getElementById("edad-alumno").value.trim()
  const correo = document.getElementById("correo-alumno").value.trim()
  if (!nombre || !edad || !correo) return
  const tx = db.transaction("alumnos", "readwrite")
  tx.objectStore("alumnos").add({ nombre, edad, correo })
  tx.oncomplete = () => {
    formAlumno.reset()
    cargarAlumnos()
  }
})

function cargarAlumnos() {
  const tx = db.transaction("alumnos", "readonly")
  const store = tx.objectStore("alumnos")
  store.getAll().onsuccess = e => {
    listaAlumnos.innerHTML = ""
    e.target.result.forEach(a => {
      const li = document.createElement("li")
      li.classList.add("item")
      li.innerHTML = `
        <div class="datos">
          <strong>${a.nombre}</strong> (${a.edad} años)<br>${a.correo}
        </div>
        <div class="acciones">
          <button class="accion_btn editar" onclick="editarAlumno(${a.id})">Editar</button>
          <button class="accion_btn eliminar" onclick="eliminarAlumno(${a.id})">Eliminar</button>
        </div>
      `
      listaAlumnos.appendChild(li)
    })
    actualizarSelects()
  }
}

function eliminarAlumno(id) {
  const tx = db.transaction("alumnos", "readwrite")
  tx.objectStore("alumnos").delete(id)
  tx.oncomplete = cargarAlumnos
}

function editarAlumno(id) {
  const nuevoNombre = prompt("Nuevo nombre:")
  const nuevaEdad = prompt("Nueva edad:")
  const nuevoCorreo = prompt("Nuevo correo:")
  if (!nuevoNombre || !nuevaEdad || !nuevoCorreo) return
  const tx = db.transaction("alumnos", "readwrite")
  const store = tx.objectStore("alumnos")
  store.get(id).onsuccess = e => {
    const alumno = e.target.result
    alumno.nombre = nuevoNombre
    alumno.edad = nuevaEdad
    alumno.correo = nuevoCorreo
    store.put(alumno)
    tx.oncomplete = cargarAlumnos
  }
}

formClase.addEventListener("submit", e => {
  e.preventDefault()
  const nombre = document.getElementById("nombre-clase").value.trim()
  const nivel = document.getElementById("nivel-clase").value.trim()
  const profesor = document.getElementById("profesor-clase").value.trim()
  const horario = document.getElementById("horario-clase").value.trim()
  const duracion = document.getElementById("duracion-clase").value.trim()
  if (!nombre || !nivel || !profesor || !horario || !duracion) return
  const tx = db.transaction("clases", "readwrite")
  tx.objectStore("clases").add({ nombre, nivel, profesor, horario, duracion })
  tx.oncomplete = () => {
    formClase.reset()
    cargarClases()
  }
})

function cargarClases() {
  const tx = db.transaction("clases", "readonly")
  const store = tx.objectStore("clases")
  store.getAll().onsuccess = e => {
    listaClases.innerHTML = ""
    e.target.result.forEach(c => {
      const li = document.createElement("li")
      li.classList.add("item")
      li.innerHTML = `
        <div class="datos">
          <strong>${c.nombre}</strong> (${c.nivel})<br>
          Prof: ${c.profesor}<br>
          Horario: ${c.horario}<br>
          Duración: ${c.duracion}
        </div>
        <div class="acciones">
          <button class="accion_btn editar" onclick="editarClase(${c.id})">Editar</button>
          <button class="accion_btn eliminar" onclick="eliminarClase(${c.id})">Eliminar</button>
        </div>
      `
      listaClases.appendChild(li)
    })
    actualizarSelects()
  }
}

function eliminarClase(id) {
  const tx = db.transaction("clases", "readwrite")
  tx.objectStore("clases").delete(id)
  tx.oncomplete = cargarClases
}

function editarClase(id) {
  const nuevoNombre = prompt("Nuevo nombre:")
  const nuevoNivel = prompt("Nuevo nivel:")
  const nuevoProfesor = prompt("Nuevo profesor:")
  const nuevoHorario = prompt("Nuevo horario:")
  const nuevaDuracion = prompt("Nueva duración:")
  if (!nuevoNombre || !nuevoNivel || !nuevoProfesor || !nuevoHorario || !nuevaDuracion) return
  const tx = db.transaction("clases", "readwrite")
  const store = tx.objectStore("clases")
  store.get(id).onsuccess = e => {
    const clase = e.target.result
    clase.nombre = nuevoNombre
    clase.nivel = nuevoNivel
    clase.profesor = nuevoProfesor
    clase.horario = nuevoHorario
    clase.duracion = nuevaDuracion
    store.put(clase)
    tx.oncomplete = cargarClases
  }
}

formEmparejar.addEventListener("submit", e => {
  e.preventDefault()
  const alumnoId = parseInt(selectAlumno.value)
  const claseId = parseInt(selectClase.value)
  if (!alumnoId || !claseId) return
  const tx = db.transaction("emparejamientos", "readwrite")
  tx.objectStore("emparejamientos").add({ alumnoId, claseId })
  tx.oncomplete = cargarEmparejamientos
})

btnLimpiarEmp.addEventListener("click", () => {
  const tx = db.transaction("emparejamientos", "readwrite")
  const store = tx.objectStore("emparejamientos")
  const clearReq = store.clear()
  clearReq.onsuccess = cargarEmparejamientos
})

function cargarEmparejamientos() {
  const tx = db.transaction(["emparejamientos", "alumnos", "clases"], "readonly")
  const empStore = tx.objectStore("emparejamientos")
  const alumStore = tx.objectStore("alumnos")
  const clasStore = tx.objectStore("clases")
  empStore.getAll().onsuccess = e => {
    listaEmparejamientos.innerHTML = ""
    e.target.result.forEach(emp => {
      alumStore.get(emp.alumnoId).onsuccess = a => {
        clasStore.get(emp.claseId).onsuccess = c => {
          const li = document.createElement("li")
          li.classList.add("item")
          li.textContent = `${a.target.result?.nombre || "?"} → ${c.target.result?.nombre || "?"}`
          listaEmparejamientos.appendChild(li)
        }
      }
    })
  }
}

function actualizarSelects() {
  const tx = db.transaction(["alumnos", "clases"], "readonly")
  const alumStore = tx.objectStore("alumnos")
  const clasStore = tx.objectStore("clases")
  alumStore.getAll().onsuccess = e => {
    selectAlumno.innerHTML = '<option value="">Seleccionar alumno</option>'
    e.target.result.forEach(a => {
      const opt = document.createElement("option")
      opt.value = a.id
      opt.textContent = a.nombre
      selectAlumno.appendChild(opt)
    })
  }
  clasStore.getAll().onsuccess = e => {
    selectClase.innerHTML = '<option value="">Seleccionar clase</option>'
    e.target.result.forEach(c => {
      const opt = document.createElement("option")
      opt.value = c.id
      opt.textContent = c.nombre
      selectClase.appendChild(opt)
    })
  }
}
