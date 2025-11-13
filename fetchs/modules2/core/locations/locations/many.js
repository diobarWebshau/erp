import fetch from 'node-fetch';

const locations = [
  {
    name: "Location A",
    description: "Description A",
    phone: "+52 123 255 7890",
    street: "Avenida Principal",
    street_number: 123,
    neighborhood: "Colonia Centro",
    city: "CDMX",
    state: "CDMX",
    country: "Mexico",
    zip_code: 106000,
    is_active: 1,
  },
  {
    name: "Location B",
    description: "Description B",
    phone: "+52 123 456 5490",
    street: "Calle Innovación",
    street_number: 456,
    neighborhood: "Parque Industrial",
    city: "Guadalajara",
    state: "Jalisco",
    country: "Mexico",
    zip_code: 64050,
    is_active: 1,
  },
  {
    name: "Location C",
    description: "Description C",
    phone: "+52 123 220 7890",
    street: "789 Industrial Park",
    street_number: 789,
    neighborhood: "Downtown",
    city: "Monterrey",
    state: "Nuevo León",
    country: "Mexico",
    zip_code: 640550,
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
