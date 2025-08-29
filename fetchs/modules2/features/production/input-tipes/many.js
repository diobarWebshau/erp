import fetch from 'node-fetch';

const inputTypes = [
  { name: "production" },
  { name: "packaging" },
];

const sendInputType = async (inputType) => {
  try {
    const response = await fetch('http://localhost:3003/production/input-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputType),
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

const sendMultipleInputTypes = async () => {
  for (let i = 0; i < inputTypes.length; i++) {
    await sendInputType(inputTypes[i]);
  }
};

export default sendMultipleInputTypes;
