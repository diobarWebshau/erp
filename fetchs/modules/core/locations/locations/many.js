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
    const response = await fetch('http://localhost:3003/locations/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(location),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      console.log(`Ubicación enviada correctamente: ${location.name}`);
    } else {
      console.error(`Error al enviar la ubicación ${location.name}:`, response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
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
