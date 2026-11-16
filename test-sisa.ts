// test-sisa.ts
async function probarScraperSisa() {
  console.log("Consultando al scraper de SISA en Fly.io...");
  
  try {
    const response = await fetch("https://ayudapi-sisa-scraper.fly.dev/api/sisa/consulta", {
      method: "POST",
      headers: {
        "Authorization": "Bearer ayudapi",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ dni: "30697892" })
    });

    console.log(`Estado HTTP: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log("Respuesta del scraper:", JSON.stringify(data, null, 2));

  } catch (error) {
    console.error("❌ Error de red al conectar con el scraper:", error);
  }
}

probarScraperSisa();