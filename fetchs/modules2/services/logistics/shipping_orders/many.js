import fetch from 'node-fetch';

const shippingOrders = [
  {
    name: "Orden de envio 1",
    status: "Released",
    carrier_id: "1",
    load_evidence: null,
    delivery_cost: "3050.00"
  },
  {
    name: "Orden de envio 2",
    status: "Released",
    carrier_id: "2",
    load_evidence: null,
    delivery_cost: "3050.00"
  },
  {
    name: "Orden de envio 3",
    status: "Released",
    carrier_id: "3",
    load_evidence: null,
    delivery_cost: "3050.00"
  }
];


const sendShippingOrder = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/logistics/shipping-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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
    console.error("Error al crear la orden de envío:", error.message);
  }
};

const sendMultipleShippingOrder = async () => {
  for (let i = 0; i < shippingOrders.length; i++) {
    await sendShippingOrder(shippingOrders[i]);
  }
};

export default sendMultipleShippingOrder;
