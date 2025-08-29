import fetch from "node-fetch";

const shippingOrdersPurchaseOrderProducts = [
  {
    shipping_order_id: 1,
    purchase_order_product_id: 1
  },
  {
    shipping_order_id: 1,
    purchase_order_product_id: 2
  },
  {
    shipping_order_id: 2,
    purchase_order_product_id: 3
  }
];

const sendShippingOrderPurchaseOrderProduct = async (data) => {
  try {
    const response = await fetch(
      "http://localhost:3003/production/shipping-orders-purchased-orders-products",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)  
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log("Relación creada:", result);
    } else {
      const errorText = await response.text();
      console.error("Error al crear relación:", response.status, errorText);
    }
  } catch (error) {
    console.error("Error en la solicitud:", error.message);
  }
};

const sendMultipleShippingOrderPurchaseOrderProducts = async () => {
  for (const relation of shippingOrdersPurchaseOrderProducts) {
    await sendShippingOrderPurchaseOrderProduct(relation);
  }
};

export default sendMultipleShippingOrderPurchaseOrderProducts;
