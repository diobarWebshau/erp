import fetch from 'node-fetch';

const productionLineProducts = [
  // LOCATION 1
  { production_line_id: 1, product_id: 1 },
  { production_line_id: 2, product_id: 2 },
  { production_line_id: 3, product_id: 3 },
  // LOCATION 3
  { production_line_id: 4, product_id: 1 },
  { production_line_id: 5, product_id: 2 },
  // LOCATION 3
  { production_line_id: 6, product_id: 1 }
];

const sendProductionLineProduct = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/production/production-lines-products', {
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

const sendMultipleProductionLineProducts = async () => {
  for (let i = 0; i < productionLineProducts.length; i++) {
    await sendProductionLineProduct(productionLineProducts[i]);
  }
};

export default sendMultipleProductionLineProducts;
