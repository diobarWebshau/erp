import fetch from 'node-fetch';

const appliedProductDiscountsClient = [
  {
    purchase_order_product_id: 1,
    product_discount_client_id: 2,
    discount_percentage: 5.25
  },
  {
    purchase_order_product_id: 2,
    product_discount_client_id: 2,
    discount_percentage: 10.00
  },
  {
    purchase_order_product_id: 3,
    product_discount_client_id: 3,
    discount_percentage: 7.75
  }
];

const sendAppliedProductDiscountClient = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/production/applied-product-discounts-clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Descuento cliente aplicado guardado:', result);
    } else {
      const errorText = await response.text();
      console.error('Error al crear el descuento cliente aplicado:', response.status, errorText);
    }
  } catch (error) {
    console.error('Error al hacer la solicitud:', error.message);
  }
};

const sendMultipleAppliedProductDiscountClient= async () => {
  for (const data of appliedProductDiscountsClient) {
    await sendAppliedProductDiscountClient(data);
  }
};

export default sendMultipleAppliedProductDiscountClient;
