fetch('home.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('contenido').innerHTML = data;
    })
function cambiarPagina(url) {
        fetch(url)
        .then(response => response.text())
        .then(data => {
            
            document.getElementById('contenido').innerHTML = data;
            cargarOpciones();
        });
    }

let opciones = ["Ahorro", "Gastos Fijos", "Entretenimiento", "Inversiones"]; 

function cargarOpciones() {
            
            const select = document.getElementById("selectOpciones");
            select.innerHTML = '<option value="" disabled selected>Elige una categoria</option>';

            opciones.forEach(opcion => {
                let nuevaOpcion = document.createElement("option");
                nuevaOpcion.value = opcion;
                nuevaOpcion.textContent = opcion;
                select.appendChild(nuevaOpcion);
            });
        }

function mostrarNuevaOpcion() {
            document.getElementById("newOptionContainer").style.display = "flex";
        }

        function agregarNuevaOpcion() {
            let nuevaOpcion = document.getElementById("newOptionInput").value.trim();
            if (nuevaOpcion && !opciones.includes(nuevaOpcion)) {
                opciones.push(nuevaOpcion);
                cargarOpciones();  
                document.getElementById("newOptionInput").value = "";
                document.getElementById("newOptionContainer").style.display = "none";
            }
        }
