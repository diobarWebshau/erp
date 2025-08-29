import fetch from 'node-fetch';

const internalProductProductionOrders = [
  {
    product_id: 1,
    location_id: 1,
    qty: 150,
  },
  {
    product_id: 2,
    location_id: 1,
    qty: 200,
  },
  {
    product_id: 3,
    location_id: 1,
    qty: 100,
  }
];

const sendInternalProductProductionOrder = async (data) => {
  try {
    const response = await fetch(
      'http://localhost:3003/production/internal-product-production-orders',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );

    const contentType = response.headers.get('content-type');

    if (response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log(data);
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
    console.error(error.message);
  }
};

const sendMultipleInternalProductProductionOrder = async () => {
  for (const internal of internalProductProductionOrders) {
    await sendInternalProductProductionOrder(internal);
  }
};

export default sendMultipleInternalProductProductionOrder;
