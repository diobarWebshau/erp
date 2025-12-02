import fetch from 'node-fetch';

const locations = [
  {
    name: "Location A",
    description: "Description A",

    street: "Avenida Principal",
    street_number: 123,
    neighborhood: "Colonia Centro",
    city: "Ciudad de México",
    state: "Ciudad de México",
    country: "México",
    zip_code: 106000,
    custom_id: "LOCA",
    production_capacity: 1000,
    location_manager: "Diobar",
    phone: "+52 123 456 7890",
  },
  {
    name: "Location B",
    description: "Description B",
    street: "Calle Innovación",
    street_number: 456,
    neighborhood: "Parque Industrial",
    city: "Monterrey",
    state: "Nuevo León",
    country: "México",
    zip_code: 64000,
    custom_id: "LOCB",
    production_capacity: 1000,
    location_manager: "Diobar",
    phone: "+52 123 456 7890",

  },
  {
    name: "Location C",
    description: "Description C",
    street: "Sunset Blvd",
    street_number: 789,
    neighborhood: "Downtown",
    city: "Los Ángeles",
    state: "California",
    country: "United States",
    zip_code: 90012,
    production_capacity: 1000,
    custom_id: "LOCC",
    location_manager: "Diobar",
    phone: "+1 123 456 7890",
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
