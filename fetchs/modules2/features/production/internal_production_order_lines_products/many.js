import fetch from 'node-fetch';

const internalProductionOrderLinesProducts = [
  {
    internal_product_production_order_id: 1,
    production_line_id: 1,
  },
  {
    internal_product_production_order_id: 2,
    production_line_id: 5,
  }
];

const sendInternalProductionOrderLinesProduct = async (data) => {
  try {
    const response = await fetch(
      'http://localhost:3003/production/internal-production-order-lines-products',
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

const sendMultipleInternalProductionOrderLinesProduct = async () => {
  for (const internal of internalProductionOrderLinesProducts) {
    await sendInternalProductionOrderLinesProduct(internal);
  }
};

export default sendMultipleInternalProductionOrderLinesProduct;
