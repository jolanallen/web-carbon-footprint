// server.js - FINAL CORRECTED VERSION
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors'); 
const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); 
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint for Carbon Analysis
app.get('/api/analyze', async (req, res) => {
    let urlToAnalyze = req.query.url;
    if (!urlToAnalyze) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }
    if (!/^https?:\/\//i.test(urlToAnalyze)) {
        urlToAnalyze = 'https://' + urlToAnalyze;
    }
    const apiUrl = `https://api.websitecarbon.com/site?url=${encodeURIComponent(urlToAnalyze)}`;
    try {
        const apiResponse = await fetch(apiUrl);
        if (!apiResponse.ok) {
            const errorData = await apiResponse.json().catch(() => ({ error: 'Carbon API returned a non-JSON error.' }));
            throw new Error(errorData.error || `Carbon API error status: ${apiResponse.status}`);
        }
        const data = await apiResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Error in /api/analyze:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// AI Chatbot Endpoint
app.post('/api/ask-ai', async (req, res) => {
    const userQuestion = req.body.question;
    if (!userQuestion) {
        return res.status(400).json({ error: 'Question is required.' });
    }

    try {
        const prompt = `You are an expert assistant on Corporate Social Responsibility (CSR). Your goal is to provide clear, concise, and helpful answers to questions about CSR. Please answer the following user question: "${userQuestion}"`;
        
        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }]
        };
        const apiKey = "AIzaSyAJzDEgRu13oqkUN_yxhG2hJgBGExVu_wI";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseData = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("Gemini API Error Response:", responseData);
            const errorMessage = responseData.error?.message || 'The AI assistant returned an error.';
            throw new Error(errorMessage);
        }
        
        if (responseData.candidates && responseData.candidates.length > 0 && responseData.candidates[0].content.parts.length > 0) {
            const text = responseData.candidates[0].content.parts[0].text;
            res.json({ answer: text });
        } else {
            console.error("Unexpected AI response format:", responseData);
            throw new Error('Could not get a valid response from the AI assistant.');
        }

    } catch (error) {
        console.error('Error in /api/ask-ai:', error.message);
        res.status(500).json({ error: error.message || 'An internal server error occurred.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
