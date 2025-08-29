import fetch from 'node-fetch';

const productionLines = [
  { name: "Línea A" },  
  { name: "Línea B" },  
  { name: "Línea C" },   
  { name: "Línea D" }   
];

const sendProductionLine = async (productionLine) => {
  try {
    const response = await fetch('http://localhost:3003/locations/production-lines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productionLine),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      console.log(`Línea de producción enviada correctamente: ${productionLine.name}`);
    } else {
      console.error(`Error al enviar la línea de producción ${productionLine.name}:`, response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error("Error al enviar la línea de producción:", error);
  }
};

const sendMultipleProductionLines = async () => {
  for (let i = 0; i < productionLines.length; i++) {
    await sendProductionLine(productionLines[i]);
  }
};

export default sendMultipleProductionLines;
