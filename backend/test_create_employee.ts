
import axios from 'axios';

const run = async () => {
    try {
        console.log('Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@spabook.com',
            password: '1234'
        });
        const token = loginResponse.data.token;
        console.log('Testing create employee with valid payload...');
        const uniqueEmail = `test.user.${Date.now()}@example.com`;
        const payload = {
            firstName: "Test",
            lastName: "User",
            email: uniqueEmail,
            phone: '1234567890',
            password: "password123",
            department: "wellness",
            designation: "aesthetician",
            commissionRate: 30,
            skills: { "massage": 5 },
            isActive: true
        };
        console.log('Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post('http://localhost:5000/api/employees', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success:', response.data);
    } catch (error: any) {
        if (error.response) {
            console.log('--- ERROR MSG ---');
            const err = error.response.data.error;
            console.log('MSG:', err.message || err.name || 'Unknown');
            console.log('Original Err:', err.original);
            if (err.errors) {
                console.log('Detail:', err.errors[0]?.message); // Validation errors
            }
            console.log('-----------------');
        } else {
            console.log('Error:', error.message);
        }
    }
};

run();
