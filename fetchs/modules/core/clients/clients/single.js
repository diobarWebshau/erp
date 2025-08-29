import fetch from 'node-fetch';

const clientData = {
  company_name: "Tech Solutions S.A.",
  tax_id: "ABC123456",
  email: "contacto@techsolutions.com",
  phone: "+52 123 456 7890",
  city: "Ciudad de México",
  state: "CDMX",
  country: "México",
  address: "Avenida Principal 123, Colonia Centro",
  payment_terms: "Net 30",
  credit_limit: 50000.0000
};

const sendClient = async () => {
  try {
    const response = await fetch('http://localhost:3003/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
      console.log('Cliente registrado correctamente:', responseData);
    } else {
      console.error('Error al registrar el cliente:', response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error('Error al registrar el cliente:', error);
  }
};

export default sendClient;
