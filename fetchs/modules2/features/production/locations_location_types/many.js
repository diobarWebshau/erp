import fetch from 'node-fetch';

const relationshipsData = [
  { location_id: 1, location_type_id: 1 },
  { location_id: 2, location_type_id: 2 },
  { location_id: 2, location_type_id: 1 },
  { location_id: 3, location_type_id: 2 },
  { location_id: 3, location_type_id: 1 }
];

const sendLocationLocationType = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/production/locations-location-types', {
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
    console.error('Error en la solicitud:', error);
  }
};

const sendMultipleLocationLocationTypes = async () => {
  for (let i = 0; i < relationshipsData.length; i++) {
    await sendLocationLocationType(relationshipsData[i]);
  }
};

export default sendMultipleLocationLocationTypes;
