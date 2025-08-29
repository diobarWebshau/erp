import fetch from 'node-fetch';

const inputTypes = [
  { name: "Tipo de insumo A" },  
  { name: "Tipo de insumo B" },  
  { name: "Tipo de insumo C" }   
];

const sendInputType = async (inputType) => {
  try {
    const response = await fetch('http://localhost:3003/products/input-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputType),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      console.log(`Tipo de insumo enviado correctamente: ${inputType.name}`);
    } else {
      console.error(`Error al enviar el tipo de insumo ${inputType.name}:`, response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error("Error al enviar el tipo de insumo:", error);
  }
};

const sendMultipleInputTypes = async () => {
  for (let i = 0; i < inputTypes.length; i++) {
    await sendInputType(inputTypes[i]);
  }
};

export default sendMultipleInputTypes;