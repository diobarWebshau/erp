import fetch from 'node-fetch';

const locations_production_lines = [
  // LOCATION 1
  { production_line_id: 1, location_id: 1 },
  { production_line_id: 2, location_id: 1 },
  { production_line_id: 3, location_id: 1 },
  // LOCATION 2
  { production_line_id: 4, location_id: 2 },
  { production_line_id: 5, location_id: 2 },
  // LOCATION 3
  { production_line_id: 6, location_id: 3 },
];

const sendLocationProductionLine = async (data) => {
  try {
    const response = await fetch('http://localhost:3003/production/locations-production-lines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const contentType = response.headers.get('content-type');

    if (response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const responseData = await response.json();
        console.log(responseData);
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
    console.error(error);
  }
};

const sendMultipleLocationProductionLine = async () => {
  for (let i = 0; i < locations_production_lines.length; i++) {
    await sendLocationProductionLine(locations_production_lines[i]);
  }
};

export default sendMultipleLocationProductionLine;
