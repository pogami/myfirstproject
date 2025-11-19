
// import fetch from 'node-fetch'; // Using native fetch

async function testApiContext() {
    const PORT = 3000;
    const API_URL = `http://localhost:${PORT}/api/chat`;

    console.log(`Testing API at ${API_URL}...`);

    const mockSyllabus = {
        id: 'test-chat-id',
        chatId: 'test-chat-id',
        courseName: 'Test Course 101',
        courseCode: 'TEST101',
        professor: null, // Intentionally null to test fallback
        syllabusText: 'This course is taught by Professor Dr. Testenstein. Office hours are Monday 2-4pm.'
    };

    const payload = {
        question: "Who is my professor?",
        context: "General Chat",
        conversationHistory: [],
        shouldCallAI: true,
        allSyllabi: [mockSyllabus]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Response:', data);

        if (data.answer && data.answer.includes('Testenstein')) {
            console.log('✅ SUCCESS: AI identified the professor from syllabusText!');
        } else {
            console.log('❌ FAILURE: AI did not identify the professor.');
            console.log('Expected "Testenstein", got:', data.answer);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testApiContext();
