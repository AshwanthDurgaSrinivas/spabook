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
const database_1 = require("./src/config/database");
const Employee_1 = __importDefault(require("./src/models/Employee"));
const User_1 = __importDefault(require("./src/models/User"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.sequelize.sync();
        const user = yield User_1.default.findOne();
        if (user) {
            const existing = yield Employee_1.default.findOne({ where: { userId: user.id } });
            if (!existing) {
                yield Employee_1.default.create({
                    userId: user.id,
                    department: 'Massage',
                    designation: 'Therapist',
                    skills: { massage: 5 }, // Ensure this matches ServiceCategory slug
                    commissionRate: 10,
                    hourlyRate: 50
                });
                console.log('Employee seeded successfully');
            }
            else {
                console.log('Employee already exists');
            }
        }
        else {
            console.log('No user found');
        }
    }
    catch (error) {
        console.error('Error seeding employee:', error);
    }
}))();
