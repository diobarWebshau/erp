import fetch from 'node-fetch';

const appliedProductDiscountsRanges = [
  {
    purchase_order_product_id: 1,
    product_discount_range_id: 1,
    unit_discount: 5.00,
    min_qty: 1.00,
    max_qty: 10.00
  },
  {
    purchase_order_product_id: 2,
    product_discount_range_id: 2,
    unit_discount: 7.50,
    min_qty: 11.00,
    max_qty: 25.00
  },
  {
    purchase_order_product_id: 3,
    product_discount_range_id: 3,
    unit_discount: 10.00,
    min_qty: 26.00,
    max_qty: 50.00
  }
];

const sendAppliedProductDiscountsRanges = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/production/applied-product-discounts-ranges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Descuento aplicado guardado:', result);
    } else {
      const errorText = await response.text();
      console.error('Error al crear el descuento aplicado:', response.status, errorText);
    }
  } catch (error) {
    console.error('Error al hacer la solicitud:', error.message);
  }
};

const sendMultipleAppliedProductDiscountRange = async () => {
  for (let data of appliedProductDiscountsRanges) {
    await sendAppliedProductDiscountsRanges(data);
  }
};

export default sendMultipleAppliedProductDiscountRange;
