import fetch from 'node-fetch';

// ✅ Completa los campos requeridos por tu tabla `locations`
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
    is_active: 1, // opcional; default 1 en DB
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

// ✅ Helper: asegura campos requeridos y tipos correctos
const toPayload = (loc) => {
  const required = ['name', 'description', 'address', 'mail', 'phone', 'city', 'state', 'country'];
  for (const k of required) {
    if (!loc[k] || (typeof loc[k] === 'string' && loc[k].trim() === '')) {
      throw new Error(`Missing required field "${k}" for location: ${loc.name ?? '(sin nombre)'}`);
    }
  }
  return {
    name: String(loc.name),
    description: String(loc.description),
    address: String(loc.address),
    mail: String(loc.mail),
    phone: String(loc.phone),
    city: String(loc.city),
    state: String(loc.state),
    country: String(loc.country),
    is_active: loc.is_active == null ? 1 : (loc.is_active ? 1 : 0),
  };
};

// ✅ Envía 1 location
const sendLocation = async (location) => {
  try {
    const payload = toPayload(location);

    const response = await fetch('http://localhost:3003/locations/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Intenta leer JSON; si falla, cae a texto
    let body;
    const text = await response.text();
    try { body = JSON.parse(text); } catch { body = text; }

    if (response.ok) {
      console.log('✅ Respuesta del servidor:', body);
      console.log(`Ubicación enviada correctamente: ${payload.name}`);
    } else {
      console.error(`❌ Error al enviar la ubicación ${payload.name}: ${response.status}`);
      console.error('Mensaje del servidor:', body);
    }
  } catch (error) {
    console.error('💥 Error al enviar la ubicación:', error?.message || error);
  }
};

// ✅ Enviar varias — versión en serie (respeta orden)
export const sendMultipleLocationsSerial = async () => {
  for (let i = 0; i < locations.length; i++) {
    await sendLocation(locations[i]);
  }
};

// ✅ Enviar varias — versión en paralelo (más rápido)
export const sendMultipleLocationsParallel = async () => {
  const results = await Promise.allSettled(locations.map(sendLocation));
  const rejected = results.filter(r => r.status === 'rejected');
  if (rejected.length) {
    console.error(`❌ Fallaron ${rejected.length} envíos`);
  } else {
    console.log('🎉 Todas las ubicaciones se enviaron correctamente');
  }
};

// Export por defecto mantiene compat con tu import actual
export default sendMultipleLocationsSerial;
