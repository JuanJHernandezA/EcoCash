let opciones = ["Ahorro", "Gastos Fijos", "Entretenimiento", "Inversiones"]; 

function cargarOpciones() {
            
            const select = document.getElementById("selectOpciones");
            select.innerHTML = '<option value="" disabled selected>Elige una opción</option>';

            opciones.forEach(opcion => {
                let nuevaOpcion = document.createElement("option");
                nuevaOpcion.value = opcion;
                nuevaOpcion.textContent = opcion;
                select.appendChild(nuevaOpcion);
            });
        }

function mostrarNuevaOpcion() {
            document.getElementById("newOptionContainer").style.display = "block";
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

cargarOpciones();