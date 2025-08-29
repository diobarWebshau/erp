import fetch from 'node-fetch';

const locations_production_lines = [
  { production_line_id: 1, location_id: 2 },
  { production_line_id: 2, location_id: 2 },
  { production_line_id: 3, location_id: 3 },
];

const sendLocationProductionLine = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/locations/locations-production-lines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Respuesta del servidor:', responseData);
      console.log(`Relación enviada correctamente: Línea de Producción ${data.production_line_id} - Ubicación ${data.location_id}`);
    } else {
      console.error(`Error al enviar la relación: Línea de Producción ${data.production_line_id} - Ubicación ${data.location_id}`, response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error("Error al enviar la relación:", error);
  }
};

const sendMultipleLocationProductionLine = async () => {
  for (let i = 0; i < locations_production_lines.length; i++) {
    await sendLocationProductionLine(locations_production_lines[i]);
  }
};

export default sendMultipleLocationProductionLine;
