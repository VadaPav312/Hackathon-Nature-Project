const API_URL = "/api/chat"; // Works for both Local (with proxy) and Render

async function runInvasiveAnalysis() {
    const userInput = document.getElementById('user-input').value;
    const responseArea = document.getElementById('response-area');
    
    console.log("DEBUG: Starting analysis for:", userInput);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { 
                        role: "system", 
                        content: "Return ONLY a raw JSON object. No markdown, no backticks. Format: {\"area_desc\": \"text\", \"hotspots\": [{\"lat\": 0, \"lng\": 0, \"species\": \"\"}]}" 
                    },
                    { role: "user", content: `Analyze invasive species in: ${userInput}` }
                ]
            })
        });

        const result = await response.json();
        
        // Groq/OpenAI format: result.choices[0].message.content
        let rawContent = result.choices[0].message.content;
        
        // CLEANER: Removes ```json ... ``` blocks if the AI adds them
        const cleanContent = rawContent.replace(/```json|```/g, "").trim();
        const data = JSON.parse(cleanContent);

        console.log("Success! Data received:", data);
        
        // Update your UI/Map here
        responseArea.innerText = data.area_desc;
        // map.flyTo([data.hotspots[0].lat, data.hotspots[0].lng], 10);

    } catch (error) {
        console.error("Sync Error:", error);
        responseArea.innerHTML = `<span style="color:red">Sync Error: Check Console</span>`;
    }
}