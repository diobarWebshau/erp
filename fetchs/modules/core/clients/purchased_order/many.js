import fetch from 'node-fetch';

const ordersData = [
  {
    order_code: 'ORD12346',
    delivery_date: '2025-04-11T12:00:00',
    status: 'Confirmada',
    client_id: 2,
    client_address_id: 2, 
    total_price: 3500.25
  },
  {
    order_code: 'ORD12347',
    delivery_date: '2025-04-12T15:00:00',
    status: 'En Proceso',
    client_id: 3,
    client_address_id: 3, 
    total_price: 4200.50
  },
  {
    order_code: 'ORD12348',
    delivery_date: '2025-04-13T18:30:00',
    status: 'Pendiente',
    client_id: 1,
    client_address_id: 1, 
    total_price: 2800.00
  }
];

const sendPurchasedOrder = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/clients/purchased-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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

const sendMultiplePurchasedOrders = async () => {
  for (let i = 0; i < ordersData.length; i++) {
    await sendPurchasedOrder(ordersData[i]);
  }
};

export default sendMultiplePurchasedOrders;
