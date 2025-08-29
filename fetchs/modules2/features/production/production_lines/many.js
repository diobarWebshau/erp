import fetch from 'node-fetch';

const productionLines = [
  { name: "Líne A" },  
  { name: "Líne B" },  
  { name: "Líne C" },   
  { name: "Líne D" },    
  { name: "Líne E" },    
  { name: "Líne F" }   
];

const sendProductionLine = async (productionLine) => {
  try {
    const response = await fetch('http://localhost:3003/production/production-lines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productionLine),
    });

    const contentType = response.headers.get('content-type');

    if (response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(data);
      } else {
        const text = await response.text();
        console.log(text);
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
    console.error("Error en la solicitud:", error);
  }
};

const sendMultipleProductionLines = async () => {
  for (let i = 0; i < productionLines.length; i++) {
    await sendProductionLine(productionLines[i]);
  }
};

export default sendMultipleProductionLines;
