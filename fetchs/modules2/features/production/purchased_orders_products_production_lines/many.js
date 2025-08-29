import fetch from 'node-fetch';

const purchasedOrdersProductsProductionLines = [
  {
    production_line_id: 1,
    purchase_order_product_id: 1
  },
  {
    production_line_id: 2,
    purchase_order_product_id: 2
  },
  {
    production_line_id: 3,
    purchase_order_product_id: 3
  }
];

const sendPurchasedOrderProductProductionLines = async (data) => {
  try {
    const response = await fetch(
      'http://localhost:3003/production/purchased-orders-products-production-lines',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log(result);
    } else {
      const errorText = await response.text();
      console.error(errorText);
    }
  } catch (error) {
    console.error(error.message);
  }
};

const sendMultiplePurchasedOrderProductLocations = async () => {
  for (const data of purchasedOrdersProductsProductionLines) {
    await sendPurchasedOrderProductProductionLines(data);
  }
};

export default sendMultiplePurchasedOrderProductLocations;
