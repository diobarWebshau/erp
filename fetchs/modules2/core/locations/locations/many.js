import fetch from 'node-fetch';

const locations = [
  {
    name: "Location A",
    description: "Description A",
    address: "123 Main St, Suite 1",
    mail: "locA@example.com",
    phone: "+52 55 0000 0001",
    city: "CDMX",
    state: "CDMX",
    country: "Mexico",
    is_active: 1,
  },
  {
    name: "Location B",
    description: "Description B",
    address: "456 Market Ave",
    mail: "locB@example.com",
    phone: "+52 33 0000 0002",
    city: "Guadalajara",
    state: "Jalisco",
    country: "Mexico",
    is_active: 1,
  },
  {
    name: "Location C",
    description: "Description C",
    address: "789 Industrial Park",
    mail: "locC@example.com",
    phone: "+52 81 0000 0003",
    city: "Monterrey",
    state: "Nuevo León",
    country: "Mexico",
    is_active: 1,
  }
];

const sendLocation = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/locations/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log(responseData);
    } else {
      console.error('Error al registrar tipo de ubicación:', response.status);
      const errorText = await response.text();
      console.error(errorText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const sendMultipleLocations = async () => {
  for (let i = 0; i < locations.length; i++) {
    await sendLocation(locations[i]);
  }
};

export default sendMultipleLocations;
