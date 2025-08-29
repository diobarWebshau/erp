import fetch from 'node-fetch'; // Cambia undici por node-fetch
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Directorio actual:', __dirname);

const products = [
  {
    name: "Producto C",
    description: "Descripción del Producto A",
    type: "Tipo A",
    sku: "A12345",
    sale_price: 150.0,
    active: 1,
    photo: "C:\\Users\\DiobarBaez\\Desktop\\Projects\\erp\\fetchs\\images\\inputs\\images.jpg"
  },
  {
    name: "Producto X",
    description: "Descripción del Producto B",
    type: "Tipo B",
    sku: "B67890",
    sale_price: 200.0,
    active: 0,
    photo: "C:\\Users\\DiobarBaez\\Desktop\\Projects\\erp\\fetchs\\images\\inputs\\images.jpg"
  },
];

const sendProductWithImage = async (product) => {
  try {
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('type', product.type);
    formData.append('sku', product.sku);
    formData.append('sale_price', product.sale_price);
    formData.append('active', product.active);

    // Verificar y leer la imagen
    const imagePath = path.normalize(product.photo); // Normaliza la ruta para que Node.js la entienda correctamente
    // console.log('Ruta de la imagen:', imagePath);

    if (!fs.existsSync(imagePath)) {
      console.error(`Product Imagen no encontrada: ${imagePath}`);
      return;
    }

    const imageFile = fs.createReadStream(imagePath);
    formData.append('photo', imageFile, path.basename(imagePath)); // Agregar la imagen al FormData

    // Realizar el fetch con FormData
    const response = await fetch('http://localhost:3003/products/products', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders() // Asegura que los headers de FormData se envíen correctamente
    });

    // Verifica si la respuesta fue exitosa
    if (response.ok) {
      // Obtener la respuesta como JSON (si es una respuesta en JSON)
      const data = await response.json(); // O usa response.text() si la respuesta es un texto
      console.log('Respuesta del servidor:', data);
      console.log(`Datos enviados correctamente para ${product.name}`);
    } else {
      console.error(`Error al enviar los datos para ${product.name}:`, response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error("Error al enviar los datos:", error);
  }
};

const sendMultipleProducts = async () => {
  for (let i = 0; i < products.length; i++) {
    await sendProductWithImage(products[i]);
  }
};

// Llamamos a la función para enviar los productos
export default sendMultipleProducts;
