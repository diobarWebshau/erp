import fetch from 'node-fetch';

const clientsData = [
  {
    company_name: "Tech Solutions S.A.",
    tax_id: "ABC123456",
    email: "contacto@techsolutions.com",
    phone: "+52 123 456 7890",
    city: "Ciudad de México",
    state: "Ciudad de México",
    country: "México",
    street: "Avenida Principal",
    street_number: 123,
    neighborhood: "Colonia Centro",
    payment_terms: "Net 30",
    credit_limit: 50000.0000,
    zip_code: 106000,
    tax_regimen: "General de Ley Personas Morales",
    cfdi: "G03 - Gastos en general",
    payment_method: "PUE"
  },
  {
    company_name: "Innova Corp.",
    tax_id: "DEF789101",
    email: "ventas@innovacorp.com",
    phone: "+52 987 654 3210",
    city: "Monterrey",
    state: "Nuevo León",
    country: "México",
    street: "Calle Innovación",
    street_number: 456,
    neighborhood: "Parque Industrial",
    payment_terms: "Net 60",
    credit_limit: 100000.0000,
    zip_code: 64000,
    tax_regimen: "Régimen Simplificado de Confianza",
    cfdi: "G01 - Adquisición de mercancías",
    payment_method: "PPD"
  },
  {
    company_name: "Global Tech Inc.",
    tax_id: "GHI112233",
    email: "info@globaltech.com",
    phone: "+1 123 456 7890",
    city: "Los Ángeles",
    state: "California",
    country: "United States",
    street: "Sunset Blvd",
    street_number: 789,
    neighborhood: "Downtown",
    payment_terms: "Net 45",
    credit_limit: 75000.0000,
    zip_code: 90012,
    tax_regimen: "Corporación extranjera",
    cfdi: "P01 - Por definir",
    payment_method: "PUE"
  }
];

const sendClient = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/clients/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const responseData = await response.json();
    } else {
      console.error('Error al registrar el cliente:', response.status);
      const errorMessage = await response.text();
      console.error('Mensaje de error del servidor:', errorMessage);
    }
  } catch (error) {
    console.error('Error de conexión o envío:', error);
  }
};

const sendMultipleClients = async () => {
  for (const client of clientsData) {
    await sendClient(client);
  }
};

export default sendMultipleClients;
