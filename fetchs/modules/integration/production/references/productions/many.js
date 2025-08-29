import fetch from 'node-fetch';

const productionsData = [
  {
    order_type: "internal",
    order_id: 1,
    qty: 50,
    scrap: 2.75
  },
  {
    order_type: "client",
    order_id: 1,
    qty: 50,
    scrap: 1.25
  },
  {
    order_type: "client",
    order_id: 2,
    qty: 50,
    scrap: 1.25
  }
];

const sendProduction = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/production/productions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Producción creada correctamente:', responseData);
    } else {
      console.error('Error al crear la producción:', response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error('Error al crear la producción:', error.message);
  }
};

const sendMultipleProductions = async () => {
  for (let i = 0; i < productionsData.length; i++) {
    await sendProduction(productionsData[i]);
  }
};

export default sendMultipleProductions;
