import fetch from 'node-fetch';

const productdiscountsClientsData = [
  {
    client_id: 1,
    product_id: 1,
    discount_percentage: 10
  },
  {
    client_id: 2,
    product_id: 2,
    discount_percentage: 30
  },
  {
    client_id: 3,
    product_id: 1,
    discount_percentage: 50
  }
];

const sendProductDiscountClient = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/production/product-discounts-clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Descuento creado correctamente:', responseData);
    } else {
      console.error('Error al crear el descuento:', response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error('Error al crear el descuento:', error.message);
  }
};

const sendMultipleProductDiscountClient = async () => {
  for (let i = 0; i < productdiscountsClientsData.length; i++) {
    await sendProductDiscountClient(productdiscountsClientsData[i]);
  }
};

export default sendMultipleProductDiscountClient;
