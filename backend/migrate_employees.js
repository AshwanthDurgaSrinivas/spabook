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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const migrate = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Connecting...');
        yield database_1.sequelize.authenticate();
        console.log('Connected.');
        console.log('Syncing...');
        // Raw query to sync because new columns might not exist if server hasn't restarted yet
        // OR rely on server having run. Let's assume server ran once.
        // But better to be safe.
        yield database_1.sequelize.sync({ alter: true });
        console.log('Synced.');
        const employees = yield Employee_1.default.findAll();
        console.log(`Found ${employees.length} employees.`);
        for (const emp of employees) {
            console.log(`Processing emp ${emp.id}...`);
            if (emp.userId) {
                const user = yield User_1.default.findByPk(emp.userId);
                if (user) {
                    console.log(`Updating emp ${emp.id} with ${user.firstName} ${user.lastName}`);
                    yield emp.update({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        phone: user.phone
                    });
                }
                else {
                    console.log(`User not found for emp ${emp.id}`);
                }
            }
            else {
                console.log(`No userId for emp ${emp.id}`);
            }
        }
    }
    catch (e) {
        console.error('Error:', e);
    }
    console.log('Done.');
    process.exit();
});
migrate();
