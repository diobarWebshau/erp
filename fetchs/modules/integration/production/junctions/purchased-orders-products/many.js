import fetch from 'node-fetch';

const purchasedOrdersProducts = [
  {
    purchase_order_id: 1,
    product_id: 1,
    qty: 100,
    product_name: "Producto A",
    recorded_price: 12.50,
    status: "Pendiente"
  },
  {
    purchase_order_id: 1,
    product_id: 2,
    qty: 100,
    product_name: "Producto B",
    recorded_price: 8.75,
    status: "Pendiente"
  },
  {
    purchase_order_id: 2,
    product_id: 1,
    qty: 100,
    product_name: "Producto A",
    recorded_price: 11.00,
    status: "En proceso"
  }
];

const sendPurchaseOrderProduct = async (data) => {
  try {
    const response = await fetch(
      'http://localhost:3003/production/purchased-orders-products',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log('Producto de orden creado:', result);
    } else {
      const errorText = await response.text();
      console.error('Error al crear producto de orden:', response.status, errorText);
    }
  } catch (error) {
    console.error('Error en la solicitud:', error.message);
  }
};

const sendMultiplePurchaseOrderProducts = async () => {
  for (const product of purchasedOrdersProducts) {
    await sendPurchaseOrderProduct(product);
  }
};

export default sendMultiplePurchaseOrderProducts;
