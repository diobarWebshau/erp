import fetch from 'node-fetch';

const purchasedOrdersProductsLocations = [
  {
    location_production_line_id: 1,
    purchase_order_product_id: 1
  },
  {
    location_production_line_id: 2,
    purchase_order_product_id: 2
  },
  {
    location_production_line_id: 1,
    purchase_order_product_id: 3
  }
];

const sendPurchasedOrderProductLocation = async (data) => {
  try {
    const response = await fetch(
      'http://localhost:3003/production/purchased-orders-products-locations-production-lines',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log('Asociación orden-producto-línea creada:', result);
    } else {
      const errorText = await response.text();
      console.error('Error al crear la asociación:', response.status, errorText);
    }
  } catch (error) {
    console.error('Error en la solicitud:', error.message);
  }
};

const sendMultiplePurchasedOrderProductLocations = async () => {
  for (const data of purchasedOrdersProductsLocations) {
    await sendPurchasedOrderProductLocation(data);
  }
};

export default sendMultiplePurchasedOrderProductLocations;
