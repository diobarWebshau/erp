import fetch from 'node-fetch';

const productProcesses = [
  { product_id: 1, process_id: 1, sort_order: 1 },
  { product_id: 1, process_id: 2, sort_order: 2 },
  { product_id: 1, process_id: 3, sort_order: 3 },
  { product_id: 2, process_id: 1, sort_order: 1 },
  { product_id: 2, process_id: 3, sort_order: 2 },
];

const sendProductProcess = async (productProcess) => {
  try {
    const response = await fetch('http://localhost:3003/production/products-processes/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productProcess),
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

const sendMultipleProductProcesses = async () => {
  for (let i = 0; i < productProcesses.length; i++) {
    await sendProductProcess(productProcesses[i]);
  }
};

export default sendMultipleProductProcesses;
