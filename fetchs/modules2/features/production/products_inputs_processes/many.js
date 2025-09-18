import fetch from 'node-fetch';

const productsInputsProcesses = [
    // *- Producto A 
    // process 1
    {
        product_id: 1,
        product_input_id: 1,
        product_process_id: 1,
        qty: 1
    },
    // process 2
    {
        product_id: 1,
        product_input_id: 2,
        product_process_id: 2,
        qty: 2
    },
    // process 3
    {
        product_id: 1,
        product_input_id: 1,
        product_process_id: 3,
        qty: 1
    },
    {
        product_id: 1,
        product_input_id: 2,
        product_process_id: 3,
        qty: 1
    },
    // *- Producto B
    // process 1
    {
        product_id: 2,
        product_input_id: 3,
        product_process_id: 4,
        qty: 1
    },
    // process 2
    {
        product_id: 2,
        product_input_id: 3,
        product_process_id: 5,
        qty: 1
    },
];

const sendProductInputProcess = async (productInputProcess) => {
  try {
    const response = await fetch('http://localhost:3003/production/products-inputs-processes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productInputProcess),
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

const sendMultipleProductsInputsProcesses = async () => {
  for (let i = 0; i < productsInputsProcesses.length; i++) {
    await sendProductInputProcess(productsInputsProcesses[i]);
  }
};

export default sendMultipleProductsInputsProcesses;
