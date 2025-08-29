import fetch from 'node-fetch';

const productDiscountsRange = [
  {
    product_id: 1,
    unit_price: 40.00,
    min_qty: 1,
    max_qty: 30
  },
  {
    product_id: 1,
    unit_price: 38.50,
    min_qty: 31,
    max_qty: 60
  },
  {
    product_id: 2,
    unit_price: 42.00,
    min_qty: 1,
    max_qty: 80
  }
];

const sendProductDiscountsRange = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/products/product-discounts-ranges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Descuento de producto por rango agregado correctamente:', responseData);
    } else {
      console.error('Error al agregar el descuento de producto por rango:', response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error('Error al agregar el descuento de producto por rango:', error);
  }
};

const sendMultipleProductDiscountsRange = async () => {
  for (let i = 0; i < productDiscountsRange.length; i++) {
    await sendProductDiscountsRange(productDiscountsRange[i]);
  }
};

export default sendMultipleProductDiscountsRange;
