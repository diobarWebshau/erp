import fetch from 'node-fetch';

const locations = [
  {
    name: "Location A",
    description: "Description A",
  },
  {
    name: "Location B",
    description: "Description B",
  },
  {
    name: "Location C",
    description: "Description C",
  }
];

const sendLocation = async (location) => {
  try {
    const response = await fetch('http://localhost:3003/production/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(location),
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
    console.error("Error al enviar la ubicación:", error);
  }
};

const sendMultipleLocations = async () => {
  for (let i = 0; i < locations.length; i++) {
    await sendLocation(locations[i]);
  }
};

export default sendMultipleLocations;
