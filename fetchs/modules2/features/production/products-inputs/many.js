import fetch from 'node-fetch';

const productsInputs = [
  { product_id: 1, input_id: 1, equivalence: 2 },
  { product_id: 1, input_id: 2, equivalence: 3 },
  { product_id: 2, input_id: 2, equivalence: 2 },
];

const sendProductInput = async (productInput) => {
  try {
    const response = await fetch('http://localhost:3003/production/products-inputs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productInput),
    });

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
    console.error(error);
  }
};

const sendMultipleProductsInputs = async () => {
  for (let i = 0; i < productsInputs.length; i++) {
    await sendProductInput(productsInputs[i]);
  }
};

export default sendMultipleProductsInputs;
