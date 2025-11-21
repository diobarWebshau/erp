import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta base donde están las imágenes
const imagesBasePath = path.join(__dirname, '..', '..', '..', '..', 'images', 'inputs');
// console.log('Directorio base de imágenes:', imagesBasePath);

const products = [
  {
    name: "Producto A",
    description: "Descripción del Producto A",
    type: "Tipo A",
    barcode: "987654321",
    presentation: "Caja x 12 unidades",
    production_cost: "152.55",
    sku: "A12345",
    sale_price: "150.0",
    active: "1",
    photo: "images.jpg",
    custom_id: "ProdA",
    is_draft: "0"
  },
  {
    name: "Producto B",
    description: "Descripción del Producto B",
    presentation: "Caja x 6 unidades",
    type: "Tipo B",
    barcode: "987654322",
    production_cost: "200.25",
    sku: "B67890",
    sale_price: "200.0",
    active: "0",
    photo: "images.jpg",
    custom_id: "ProdB",
    is_draft: "0"
  },
  {
    name: "Producto C",
    description: "Descripción del Producto C",
    type: "Tipo B",
    presentation: "Caja x 24 unidades",
    barcode: "987654323",
    sku: "B6789052",
    production_cost: "250.75",
    sale_price: "300.0",
    active: "0",
    photo: "images.jpg",
    custom_id: "ProdC",
    is_draft: "0"
  },
];

const sendProductWithImage = async (product) => {
  try {
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('type', product.type);
    formData.append('barcode', product.barcode);
    formData.append('sku', product.sku);
    formData.append('sale_price', product.sale_price);
    formData.append('active', product.active);
    formData.append('custom_id', product.custom_id);
    formData.append('presentation', product.presentation);
    formData.append('production_cost', product.production_cost);
    formData.append('is_draft', product.is_draft);

    const imagePath = path.join(imagesBasePath, product.photo);
    // console.log(imagePath);

    if (!fs.existsSync(imagePath)) {
      console.error(`Imagen no encontrada: ${imagePath}`);
      return;
    }

    const imageFile = fs.createReadStream(imagePath);
    formData.append('photo', imageFile, path.basename(imagePath));

    const response = await fetch('http://localhost:3003/products/products', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const contentType = response.headers.get('content-type');

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

const sendMultipleProducts = async () => {
  for (let i = 0; i < products.length; i++) {
    await sendProductWithImage(products[i]);
  }
};

export default sendMultipleProducts;
