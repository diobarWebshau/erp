import fetch from 'node-fetch';

const shippingOrders = [
  {
    name: "Orden de envio 1",
    status: "Released",
    carrier_id: 1,
    load_evidence:[
      { "url": "imagen1.jpg", "description": "Vista frontal" },
      { "url": "imagen2.jpg", "description": "Vista lateral" },
      { "url": "imagen3.jpg", "description": "Vista trasera" }
    ],
    delivery_cost: 3050.00
  },
  {
    name: "Orden de envio 2",
    status: "Released",
    carrier_id: 2,
    load_evidence:[
      { "url": "imagen1.jpg", "description": "Vista frontal" },
      { "url": "imagen2.jpg", "description": "Vista lateral" },
      { "url": "imagen3.jpg", "description": "Vista trasera" }
    ],
    delivery_cost: 3050.00
  },
  {
    name: "Orden de envio 3",
    status: "Released",
    carrier_id: 3,
    load_evidence:[
      { "url": "imagen1.jpg", "description": "Vista frontal" },
      { "url": "imagen2.jpg", "description": "Vista lateral" },
      { "url": "imagen3.jpg", "description": "Vista trasera" }
    ],
    delivery_cost: 3050.00
  }
];

const sendShippingOrder = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/logistics/shipping-orders', {
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

const sendMultipleShippingOrder = async () => {
  for (let i = 0; i < shippingOrders.length; i++) {
    await sendShippingOrder(shippingOrders[i]);
  }
};

export default sendMultipleShippingOrder;