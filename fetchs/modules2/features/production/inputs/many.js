import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración para obtener el directorio actual del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta absoluta base donde están las imágenes
const imagesBasePath = path.join(__dirname, '..', '..', '..', '..', 'images', 'inputs');

// console.log('Directorio base de imágenes:', imagesBasePath);

const inputs = [
  {
    id: 1,
    name: "Insumo x",
    input_types_id: 1,
    unit_cost: 50.5,
    supplier: "Proveedor 1",
    photo: "images.jpg", 
    status: 1
  },
  {
    id: 2,
    name: "Insumo z",
    input_types_id: 1,
    unit_cost: 75.0,
    supplier: "Proveedor 2",
    photo: "images.jpg",
    status: 1
  },
];

// Función para enviar un insumo con su imagen
const sendDataWithImage = async (input) => {
  try {
    const formData = new FormData();
    formData.append('id', input.id);
    formData.append('name', input.name);
    formData.append('input_types_id', input.input_types_id);
    formData.append('unit_cost', input.unit_cost);
    formData.append('supplier', input.supplier);
    formData.append('status', input.status);

    const imagePath = path.join(imagesBasePath, input.photo); // Ruta completa del archivo
    // console.log('Ruta de la imagen:', imagePath);

    if (!fs.existsSync(imagePath)) {
      console.error(`Imagen no encontrada: ${imagePath}`);
      return;
    }

    const imageFile = fs.createReadStream(imagePath);
    formData.append('photo', imageFile, path.basename(imagePath));

    const response = await fetch('http://localhost:3003/production/inputs', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const contentType = response.headers.get("content-type");

    if (response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        console.log(responseData);
      } else {
        const text = await response.text();
        console.warn(text);
      }
    } else {
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        console.error(errorData);
      } else {
        const errorText = await response.text();
        console.error(errorText);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const sendMultipleInputs = async () => {
  for (let i = 0; i < inputs.length; i++) {
    await sendDataWithImage(inputs[i]);
  }
};

export default sendMultipleInputs;
