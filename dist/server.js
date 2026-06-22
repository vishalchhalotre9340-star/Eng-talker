"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const api_routes_1 = __importDefault(require("./routes/api.routes"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Restrict CORS to a specific origin for better security
const corsOptions = {
    origin: 'https://app.amunet.ai',
    credentials: true, // Allows cookies to be sent
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use('/api', api_routes_1.default);
app.get('/', (req, res) => {
    res.send('Amunet AI Backend is running.');
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
