import fetch from 'node-fetch'; // Cambia undici por node-fetch
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Definimos __dirname
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Directorio actual:', __dirname);

const input = {
  id: 1,
  name: "Producto B",
  input_types_id: 1,
  unit_cost: 50.5,
  supplier: "Proveedor 1",
  url: "C:\\Users\\Dioba\\Desktop\\webshauProjects\\erp\\fetchs\\images\\inputs\\images.jpg", // Ruta absoluta en Windows
  status: 1
};

// Función para enviar un solo producto con su imagen
const sendDataWithImage = async (input) => {
  try {
    const formData = new FormData();
    formData.append('id', input.id);
    formData.append('name', input.name);
    formData.append('input_types_id', input.input_types_id);
    formData.append('unit_cost', input.unit_cost);
    formData.append('supplier', input.supplier);
    formData.append('status', input.status);

    // Verificar y leer la imagen
    const imagePath = path.normalize(input.url); // Normaliza la ruta para que Node.js la entienda correctamente
    console.log('Ruta de la imagen:', imagePath);

    if (!fs.existsSync(imagePath)) {
      console.error(`Imagen no encontrada: ${imagePath}`);
      return;
    }

    // Asegúrate de leer la imagen correctamente
    const imageFile = fs.createReadStream(imagePath);
    formData.append('url', imageFile, path.basename(imagePath)); // Agregar la imagen al FormData

    // Realizar el fetch con FormData
    const response = await fetch('http://localhost:3003/inputs', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders() // Asegura que los headers de FormData se envíen correctamente
    });

    // Verifica si la respuesta fue exitosa
    if (response.ok) {
      // Obtener la respuesta como JSON (si es una respuesta en JSON)
      const data = await response.json(); // O usa response.text() si la respuesta es un texto
      console.log('Respuesta del servidor:', data);
      console.log(`Datos enviados correctamente para ${input.name}`);
    } else {
      console.error(`Error al enviar los datos para ${input.name}:`, response.status);
      const errorMessage = await response.text(); // Para obtener el mensaje de error en caso de fallo
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error("Error al enviar los datos:", error);
  }
};

// Llamamos a la función para enviar un solo producto
sendDataWithImage(input);
