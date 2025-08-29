import fetch from 'node-fetch';

const orderData = {
  order_code: 'ORD12345',
  delivery_date: '2025-04-10T10:30:00',
  status: 'Pendiente',
  client_id: 1,
  total_price: 1500.75
};

const sendOrder = async () => {
  try {
    const response = await fetch('http://localhost:3003/purchased-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Orden de compra creada correctamente:', responseData);
    } else {
      console.error('Error al crear la orden de compra:', response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error('Error al crear la orden de compra:', error);
  }
};

export default sendOrder;
