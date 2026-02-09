import express from "express";
import { signup ,login} from "../controllers/auth.controller.js";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";
const app = express.Router();

app.post("/signup", signup);
app.post("/login", login);


app.post("/send-otp", sendOtp);
app.post("/verify-otp", verifyOtp);

export default app;