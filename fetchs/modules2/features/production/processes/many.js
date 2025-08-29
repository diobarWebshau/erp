import fetch from 'node-fetch';

const processes = [
  { name: "Proceso A" },
  { name: "Proceso B" },
  { name: "Proceso C" }
];

const sendProcess = async (process) => {
  try {
    const response = await fetch('http://localhost:3003/production/processes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(process),
    });

    const contentType = response.headers.get('content-type');

    if (response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(data);
      } else {
        const text = await response.text();
        console.warn(text);
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

const sendMultipleProcesses = async () => {
  for (let i = 0; i < processes.length; i++) {
    await sendProcess(processes[i]);
  }
};

export default sendMultipleProcesses;
