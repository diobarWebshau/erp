import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Directorio actual:', __dirname);

const inputs = [
  {
    id: 1,
    name: "Insumo x",
    input_types_id: 1,
    unit_cost: 50.5,
    supplier: "Proveedor 1",
    photo: "C:\\Users\\DiobarBaez\\Desktop\\Projects\\erp\\fetchs\\images\\inputs\\images.jpg",
    status: 1
  },
  {
    id: 2,
    name: "Insumo z",
    input_types_id: 1,
    unit_cost: 75.0,
    supplier: "Proveedor 2",
    photo: "C:\\Users\\DiobarBaez\\Desktop\\Projects\\erp\\fetchs\\images\\inputs\\images.jpg",
    status: 1
  },
];

const sendDataWithImage = async (input) => {
  try {
    const formData = new FormData();
    formData.append('id', input.id);
    formData.append('name', input.name);
    formData.append('input_types_id', input.input_types_id);
    formData.append('unit_cost', input.unit_cost);
    formData.append('supplier', input.supplier);
    formData.append('status', input.status);

    const imagePath = path.normalize(input.photo);
    console.log('Ruta de la imagen:', imagePath);

    if (!fs.existsSync(imagePath)) {
      console.error(`Imagen no encontrada: ${imagePath}`);
      return;
    }

    const imageFile = fs.createReadStream(imagePath);
    formData.append('photo', imageFile, path.basename(imagePath));

    const response = await fetch('http://localhost:3003/products/inputs', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

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

const sendMultipleInputs = async () => {
  for (let i = 0; i < inputs.length; i++) {
    await sendDataWithImage(inputs[i]);
  }
};

export default sendMultipleInputs;
