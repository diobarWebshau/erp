import fetch from 'node-fetch';

const productionsData = [
  // client orders
  {
    order_type: "client",
    order_id: 1,
    product_id: 1,
    qty: 25,
    scrap: 100
  },
  {
    order_type: "client",
    order_id: 1,
    product_id: 1,
    qty: 25,
    scrap: 100
  },
  {
    order_type: "client",
    order_id: 2,
    product_id: 2,
    qty: 20,
    scrap: 100
  },
  {
    order_type: "client",
    order_id: 2,
    product_id: 2,
    qty: 20,
    scrap: 100
  },
  {
    order_type: "client",
    order_id: 4,
    product_id: 1,
    qty: 100,
    scrap: 100
  },
  {
    order_type: "client",
    order_id: 5,
    product_id: 2,
    qty: 20,
    scrap: 100
  },
  // Internal orders
  {
    order_type: "internal",
    order_id: 1,
    product_id: 1,
    qty: 100,
    scrap: 100
  },
  {
    order_type: "internal",
    order_id: 1,
    product_id: 1,
    qty: 50,
    scrap: 100
  },
  {
    order_type: "internal",
    order_id: 2,
    product_id: 2,
    qty: 50,
    scrap: 300
  },
  {
    order_type: "client",
    order_id: 3,
    product_id: 3,
    qty: 50,
    scrap: 300
  }
]

const sendProduction = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/production/productions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const contentType = response.headers.get('content-type');

    if (response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        console.log(responseData);
      } else {
        const text = await response.text();
        console.log(text);
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

const sendMultipleProductions = async () => {
  for (let i = 0; i < productionsData.length; i++) {
    await sendProduction(productionsData[i]);
  }
};

export default sendMultipleProductions;
