import fetch from 'node-fetch';

const locationTypesData = [
  { name: 'Store' },
  { name: 'Productión' },
];

const sendLocationType = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/production/location-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const contentType = response.headers.get('content-type');

    if (response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        console.log(responseData);
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

const sendMultipleLocationTypes = async () => {
  for (let i = 0; i < locationTypesData.length; i++) {
    await sendLocationType(locationTypesData[i]);
  }
};

export default sendMultipleLocationTypes;
