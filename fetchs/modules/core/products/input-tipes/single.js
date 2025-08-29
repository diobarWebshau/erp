import fetch from 'node-fetch';

const inputType = {
  name: "Tipo A"  
};

const sendInputType = async () => {
  try {
    const response = await fetch('http://localhost:3003/products/input-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputType),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      console.log(`Tipo de entrada enviado correctamente: ${inputType.name}`);
    } else {
      console.error(`Error al enviar el tipo de entrada ${inputType.name}:`, response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error("Error al enviar el tipo de entrada:", error);
  }
};

export default sendInputType;