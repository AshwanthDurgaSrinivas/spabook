"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('Logging in...');
        const loginResponse = yield axios_1.default.post('http://localhost:5000/api/auth/login', {
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
        const response = yield axios_1.default.post('http://localhost:5000/api/employees', payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success:', response.data);
    }
    catch (error) {
        if (error.response) {
            console.log('--- ERROR MSG ---');
            const err = error.response.data.error;
            console.log('MSG:', err.message || err.name || 'Unknown');
            console.log('Original Err:', err.original);
            if (err.errors) {
                console.log('Detail:', (_a = err.errors[0]) === null || _a === void 0 ? void 0 : _a.message); // Validation errors
            }
            console.log('-----------------');
        }
        else {
            console.log('Error:', error.message);
        }
    }
});
run();
