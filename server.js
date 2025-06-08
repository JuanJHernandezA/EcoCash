const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.'));

// Función auxiliar para asegurar que el archivo existe
async function asegurarArchivo() {
    try {
        await fs.access('data.txt');
    } catch {
        await fs.writeFile('data.txt', '');
    }
}


// Función para validar el formato de un movimiento
function validarMovimiento(campos) {
    console.log(campos);
    console.log(campos.length);
    if (campos.length !== 6) {
        return false;
    }
    const [id, fecha, tipo, categoria, descripcion, monto] = campos;
    // Verificar que todos los campos existan y no estén vacíos
    return id && fecha && tipo && categoria && descripcion && monto && 
           id.trim() !== '' && fecha.trim() !== '' && tipo.trim() !== '' && 
           categoria.trim() !== '' && descripcion.trim() !== '' && 
           monto.trim() !== '' ;
}

// Ruta para agregar un nuevo movimiento
app.post('/agregarMovimiento', async (req, res) => {
    
    try {
        await asegurarArchivo();
        const { nuevoMovimiento } = req.body;
       
        const movimientoConId = `${nuevoMovimiento}`;
        console.log(movimientoConId);

        // Validar el formato antes de guardar
        const campos = movimientoConId.split(',');
       
        console.log(campos);
        console.log(campos.length);
        if (!validarMovimiento(campos)) {
            throw new Error('Formato de movimiento inválidos');
        }

        await fs.appendFile('data.txt', movimientoConId + '\n');
        res.json({ success: true});
    } catch (error) {
        console.error('Error al agregar movimiento:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Ruta para actualizar movimientos (editar o eliminar)
app.post('/actualizarMovimiento', async (req, res) => {
    try {
        await asegurarArchivo();
        const { contenido } = req.body;
        
        if (!contenido) {
            throw new Error('No se proporcionó contenido para actualizar');
        }

        // Validar cada línea del contenido
        const lineas = contenido.split('\n').filter(linea => linea.trim());
        for (const linea of lineas) {
            const campos = linea.split(',');
            if (!validarMovimiento(campos)) {
                throw new Error('Formato de datos inválido en una o más líneas');
            }
        }

        // Asegurar que el contenido termina con un salto de línea
        const contenidoFinal = contenido.trim() + '\n';
        await fs.writeFile('data.txt', contenidoFinal);
        res.json({ success: true });
    } catch (error) {
        console.error('Error al actualizar movimientos:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
}); 