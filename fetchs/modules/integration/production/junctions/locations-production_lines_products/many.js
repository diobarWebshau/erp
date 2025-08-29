import fetch from 'node-fetch';

const locationLineProducts = [
  {
    location_production_line_id: 1,
    product_id: 1
  },
  {
    location_production_line_id: 2,
    product_id: 2
  },
  {
    location_production_line_id: 2,
    product_id: 1
  }
];

const sendLocationLineProduct = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/production/locations-production-lines-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Asociación ubicación-línea-producto creada:', result);
    } else {
      const errorText = await response.text();
      console.error('Error al crear la asociación:', response.status, errorText);
    }
  } catch (error) {
    console.error('Error en la solicitud:', error.message);
  }
};

const sendMultipleLocationLineProducts = async () => {
  for (const data of locationLineProducts) {
    await sendLocationLineProduct(data);
  }
};

export default sendMultipleLocationLineProducts;
