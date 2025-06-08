// Función para cargar diferentes páginas
function cargarPagina(pagina) {
    const contenido = document.getElementById('contenido');
    
    if (pagina === 'dashboard') {
        contenido.innerHTML = `
            <div class="dashboard">
                <div class="chart-container">
                    <h2>Ingresos vs Egresos</h2>
                    <canvas id="ingresosEgresosChart"></canvas>
                </div>
                <div class="chart-container">
                    <h2>Balance Mensual</h2>
                    <canvas id="balanceMensualChart"></canvas>
                </div>
                <div class="chart-container">
                    <h2>Distribución de Ingresos</h2>
                    <canvas id="distribucionIngresosChart"></canvas>
                </div>
                <div class="chart-container">
                    <h2>Distribución de Egresos</h2>
                    <canvas id="distribucionEgresosChart"></canvas>
                </div>
                <div class="chart-container">
                    <h2>Tendencia de Ingresos</h2>
                    <canvas id="tendenciaIngresosChart"></canvas>
                </div>
                <div class="chart-container">
                    <h2>Tendencia de Egresos</h2>
                    <canvas id="tendenciaEgresosChart"></canvas>
                </div>
            </div>
        `;
        cargarGraficas();
    } else if (pagina === 'movimientos') {
        contenido.innerHTML = `
            <div class="movimientos-container">
                <div class="form-container">
                    <h2>Nuevo Movimiento</h2>
                    <form id="movimientoForm" onsubmit="agregarMovimiento(event)">
                        <div class="form-group">
                            <label for="tipo">Tipo de Movimiento</label>
                            <select id="tipo" required>
                                <option value="Ingreso">Ingreso</option>
                                <option value="Egreso">Egreso</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="monto">Monto</label>
                            <input type="number" id="monto" required min="0" step="0.01">
                        </div>
                        <div class="form-group">
                            <label for="descripcion">Descripción</label>
                            <input type="text" id="descripcion" required>
                        </div>
                        <div class="form-group">
                            <label for="fecha">Fecha</label>
                            <input type="date" id="fecha" required>
                        </div>
                        <div class="form-group">
                            <label for="categoria">Categoría</label>
                            <div class="categoria-container">
                                <select id="categoria" required>
                                    <option value="" disabled selected>Seleccione una categoría</option>
                                </select>
                                <button type="button" onclick="mostrarNuevaCategoria()">+</button>
                            </div>
                            <div class="nueva-categoria" id="nuevaCategoriaContainer">
                                <input type="text" id="nuevaCategoria" placeholder="Nueva categoría">
                                <button type="button" onclick="agregarCategoria()">Agregar</button>
                            </div>
                        </div>
                        <button type="submit">Guardar Movimiento</button>
                    </form>
                </div>
                <div class="movimientos-list">
                    <h2>Últimos Movimientos</h2>
                    <div id="listaMovimientos"></div>
                </div>
            </div>
        `;
        cargarCategorias();
        cargarMovimientos();
    }
}

// Función para cargar las gráficas
function cargarGraficas() {
    fetch('data.txt')
        .then(response => response.text())
        .then(data => {
            const movimientos = procesarDatos(data);
            crearGraficas(movimientos);
        })
        .catch(error => console.error('Error:', error));
}

// Función para procesar los datos del archivo
function procesarDatos(data) {
    console.log('Datos originales:', data); // Debug
    const lineas = data.split('\n').filter(linea => linea.trim());
    console.log('Líneas filtradas:', lineas); // Debug
    
    const movimientos = lineas.map(linea => {
        const [id, tipo, monto, descripcion, categoria, fecha] = linea.split(',');
        console.log('Procesando línea:', { id, tipo, monto, descripcion, categoria, fecha }); // Debug
        return {
            id: parseInt(id) || 0,
            tipo: tipo.trim(),
            monto: parseFloat(monto) || 0,
            descripcion: descripcion.trim(),
            categoria: categoria.trim(),
            fecha: fecha.trim()
        };
    });
    
    console.log('Movimientos procesados:', movimientos); // Debug
    return movimientos;
}

// Función para crear las gráficas
function crearGraficas(movimientos) {
    console.log('Creando gráficas con movimientos:', movimientos); // Debug
    
    if (!movimientos || movimientos.length === 0) {
        console.error('No hay movimientos para mostrar en las gráficas');
        return;
    }

    // Gráfica de Ingresos vs Egresos
    const ingresosEgresosCtx = document.getElementById('ingresosEgresosChart');
    if (ingresosEgresosCtx) {
        new Chart(ingresosEgresosCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Egresos'],
                datasets: [{
                    data: [
                        movimientos.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + m.monto, 0),
                        movimientos.filter(m => m.tipo === 'Egreso').reduce((sum, m) => sum + Math.abs(m.monto), 0)
                    ],
                    backgroundColor: ['#27ae60', '#e74c3c']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Gráfica de Balance Mensual
    const balanceMensualCtx = document.getElementById('balanceMensualChart');
    if (balanceMensualCtx) {
        const meses = [...new Set(movimientos.map(m => m.fecha.substring(0, 7)))].sort();
        const balanceMensual = meses.map(mes => {
            const ingresos = movimientos
                .filter(m => m.tipo === 'Ingreso' && m.fecha.startsWith(mes))
                .reduce((sum, m) => sum + m.monto, 0);
            const egresos = movimientos
                .filter(m => m.tipo === 'Egreso' && m.fecha.startsWith(mes))
                .reduce((sum, m) => sum + Math.abs(m.monto), 0);
            return ingresos - egresos;
        });

        new Chart(balanceMensualCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Balance',
                    data: balanceMensual,
                    borderColor: '#3498db',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // Gráfica de Distribución de Ingresos
    const distribucionIngresosCtx = document.getElementById('distribucionIngresosChart');
    if (distribucionIngresosCtx) {
        const categoriasIngresos = [...new Set(movimientos.filter(m => m.tipo === 'Ingreso').map(m => m.categoria))];
        const totalIngresos = categoriasIngresos.map(cat => 
            movimientos
                .filter(m => m.tipo === 'Ingreso' && m.categoria === cat)
                .reduce((sum, m) => sum + m.monto, 0)
        );

        new Chart(distribucionIngresosCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: categoriasIngresos,
                datasets: [{
                    data: totalIngresos,
                    backgroundColor: ['#27ae60', '#2ecc71', '#16a085', '#1abc9c', '#2980b9']
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // Gráfica de Distribución de Egresos
    const distribucionEgresosCtx = document.getElementById('distribucionEgresosChart');
    if (distribucionEgresosCtx) {
        const categoriasEgresos = [...new Set(movimientos.filter(m => m.tipo === 'Egreso').map(m => m.categoria))];
        const totalEgresos = categoriasEgresos.map(cat => 
            movimientos
                .filter(m => m.tipo === 'Egreso' && m.categoria === cat)
                .reduce((sum, m) => sum + Math.abs(m.monto), 0)
        );

        new Chart(distribucionEgresosCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: categoriasEgresos,
                datasets: [{
                    data: totalEgresos,
                    backgroundColor: ['#e74c3c', '#c0392b', '#d35400', '#e67e22', '#f39c12']
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // Gráfica de Tendencia de Ingresos
    const tendenciaIngresosCtx = document.getElementById('tendenciaIngresosChart');
    if (tendenciaIngresosCtx) {
        const meses = [...new Set(movimientos.map(m => m.fecha.substring(0, 7)))].sort();
        const ingresosPorMes = meses.map(mes => 
            movimientos
                .filter(m => m.tipo === 'Ingreso' && m.fecha.startsWith(mes))
                .reduce((sum, m) => sum + m.monto, 0)
        );

        new Chart(tendenciaIngresosCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Ingresos',
                    data: ingresosPorMes,
                    borderColor: '#27ae60',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // Gráfica de Tendencia de Egresos
    const tendenciaEgresosCtx = document.getElementById('tendenciaEgresosChart');
    if (tendenciaEgresosCtx) {
        const meses = [...new Set(movimientos.map(m => m.fecha.substring(0, 7)))].sort();
        const egresosPorMes = meses.map(mes => 
            movimientos
                .filter(m => m.tipo === 'Egreso' && m.fecha.startsWith(mes))
                .reduce((sum, m) => sum + Math.abs(m.monto), 0)
        );

        new Chart(tendenciaEgresosCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Egresos',
                    data: egresosPorMes,
                    borderColor: '#e74c3c',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true
            }
        });
    }
}

// Función para cargar categorías
function cargarCategorias() {
    fetch('data.txt')
        .then(response => response.text())
        .then(data => {
            const categorias = new Set();
            data.split('\n').forEach(linea => {
                if (linea.trim()) {
                    const categoria = linea.split(',')[4];
                    if (categoria) categorias.add(categoria);
                }
            });
            
            const select = document.getElementById('categoria');
            select.innerHTML = '<option value="" disabled selected>Seleccione una categoría</option>';
            Array.from(categorias).sort().forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria;
                option.textContent = categoria;
                select.appendChild(option);
            });
        });
}

// Función para mostrar el formulario de nueva categoría
function mostrarNuevaCategoria() {
    const container = document.getElementById('nuevaCategoriaContainer');
    container.classList.add('visible');
}

// Función para agregar nueva categoría
function agregarCategoria() {
    const input = document.getElementById('nuevaCategoria');
    const categoria = input.value.trim();
    
    if (categoria) {
        const select = document.getElementById('categoria');
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        select.appendChild(option);
        select.value = categoria;
        
        input.value = '';
        document.getElementById('nuevaCategoriaContainer').classList.remove('visible');
    }
}

// Función para agregar un nuevo movimiento
function agregarMovimiento(event) {
    event.preventDefault();
    
    const tipo = document.getElementById('tipo').value;
    const monto = document.getElementById('monto').value;
    const descripcion = document.getElementById('descripcion').value;
    const fecha = document.getElementById('fecha').value;
    const categoria = document.getElementById('categoria').value;
    
    // Obtener el último ID
    fetch('data.txt')
        .then(response => response.text())
        .then(data => {
            const lineas = data.split('\n').filter(linea => linea.trim());
            let ultimoId = 0;
            
            if (lineas.length > 0) {
                const ultimaLinea = lineas[lineas.length - 1];
                ultimoId = parseInt(ultimaLinea.split(',')[0]);
            }
            
            const nuevoId = ultimoId + 1;
            const montoFormateado = tipo === 'Egreso' ? `-${monto}` : monto;
            const nuevoMovimiento = `${nuevoId},${tipo},${montoFormateado},${descripcion},${categoria},${fecha}\n`;
            
            return fetch('agregarMovimiento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nuevoMovimiento })
            });
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Movimiento agregado exitosamente');
                document.getElementById('movimientoForm').reset();
                cargarMovimientos();
                cargarPagina('dashboard');
            } else {
                alert('Error al agregar el movimiento');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al agregar el movimiento');
        });
}

// Función para cargar los movimientos
function cargarMovimientos() {
    fetch('data.txt')
        .then(response => response.text())
        .then(data => {
            const movimientos = data.split('\n')
                .filter(linea => linea.trim())
                .map(linea => {
                    const [id, tipo, monto, descripcion, categoria, fecha] = linea.split(',');
                    return {
                        id,
                        tipo,
                        monto: parseFloat(monto),
                        descripcion,
                        categoria,
                        fecha: fecha.trim()
                    };
                })
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            const lista = document.getElementById('listaMovimientos');
            lista.innerHTML = movimientos.map(m => `
                <div class="movimiento-item ${m.tipo.toLowerCase()}">
                    <div class="movimiento-info">
                        <strong>${m.monto}</strong>
                        <div>${m.descripcion}</div>
                        <div>${m.categoria} - ${m.fecha}</div>
                    </div>
                    <div class="movimiento-acciones">
                        <button class="btn-accion btn-editar" onclick="editarMovimiento('${m.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-accion btn-eliminar" onclick="eliminarMovimiento('${m.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        });
}

function editarMovimiento(id) {
    fetch('data.txt')
        .then(response => response.text())
        .then(data => {
            const movimientos = data.split('\n').filter(linea => linea.trim());
            const movimiento = movimientos.find(m => m.split(',')[0] === id);
            if (movimiento) {
                const [_, tipo, monto, descripcion, categoria, fecha] = movimiento.split(',');
                mostrarModalEdicion({
                    id,
                    tipo,
                    monto: Math.abs(parseFloat(monto)),
                    descripcion,
                    categoria,
                    fecha
                });
            }
        });
}

function mostrarModalEdicion(movimiento) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-contenido">
            <span class="cerrar-modal" onclick="cerrarModal()">&times;</span>
            <h2>Editar Movimiento</h2>
            <form id="editarForm" onsubmit="guardarEdicion(event)">
                <input type="hidden" id="editId" value="${movimiento.id}">
                <div class="form-group">
                    <label for="editTipo">Tipo de Movimiento</label>
                    <select id="editTipo" required>
                        <option value="Ingreso" ${movimiento.tipo === 'Ingreso' ? 'selected' : ''}>Ingreso</option>
                        <option value="Egreso" ${movimiento.tipo === 'Egreso' ? 'selected' : ''}>Egreso</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editMonto">Monto</label>
                    <input type="number" id="editMonto" required min="0" step="1" value="${movimiento.monto}">
                </div>
                <div class="form-group">
                    <label for="editDescripcion">Descripción</label>
                    <input type="text" id="editDescripcion" required value="${movimiento.descripcion}">
                </div>
                <div class="form-group">
                    <label for="editFecha">Fecha</label>
                    <input type="date" id="editFecha" required value="${movimiento.fecha}">
                </div>
                <div class="form-group">
                    <label for="editCategoria">Categoría</label>
                    <select id="editCategoria" required>
                        <option value="${movimiento.categoria}" selected>${movimiento.categoria}</option>
                    </select>
                </div>
                <button type="submit">Guardar Cambios</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
    cargarCategorias('editCategoria');
}

function cerrarModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

function guardarEdicion(event) {
    event.preventDefault();
    
    const id = document.getElementById('editId').value;
    const tipo = document.getElementById('editTipo').value;
    let monto = document.getElementById('editMonto').value;
    const descripcion = document.getElementById('editDescripcion').value;
    const fecha = document.getElementById('editFecha').value;
    const categoria = document.getElementById('editCategoria').value;
    
   
    fetch('data.txt')
        .then(response => response.text())
        .then(data => {
            const lineas = data.split('\n').filter(linea => linea.trim());
            const nuevasLineas = lineas.map(linea => {
                const [lineaId,typeOld] = linea.split(',');
                if (lineaId === id){
                    if(typeOld !== tipo) {
                    monto= (-1 * parseFloat(monto)).toString();
                }}
                const movimientoEditado = `${id},${tipo},${monto},${descripcion},${categoria},${fecha}`;
                return lineaId === id ? movimientoEditado : linea;
            });
            
            return fetch('actualizarMovimiento', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    contenido: nuevasLineas.join('\n') + '\n'
                })
            });
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Movimiento actualizado exitosamente');
                cerrarModal();
                cargarMovimientos();
                cargarPagina('dashboard');
            } else {
                alert('Error al actualizar el movimiento');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al actualizar el movimiento');
        });
}

function eliminarMovimiento(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este movimiento?')) {
        fetch('data.txt')
            .then(response => response.text())
            .then(data => {
                const lineas = data.split('\n').filter(linea => linea.trim());
                const nuevasLineas = lineas.filter(linea => {
                    const [lineaId] = linea.split(',');
                    return lineaId !== id;
                });
                
                return fetch('actualizarMovimiento', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        contenido: nuevasLineas.join('\n') + '\n'
                    })
                });
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Movimiento eliminado exitosamente');
                    cargarMovimientos();
                    cargarPagina('dashboard');
                } else {
                    alert('Error al eliminar el movimiento');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al eliminar el movimiento');
            });
    }
}

// Cargar la página de dashboard por defecto
cargarPagina('dashboard'); 