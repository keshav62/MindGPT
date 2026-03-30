import express from 'express'; 
import 'dotenv/config'; 
import cors from 'cors'; 
import connectDB from './configs/db.js';
import userRouter from './routes/userRouters.js';


const app = express(); 

await connectDB(); 

//Middleware 
app.use(cors()); 
app.use(express.json()); 

// Router
app.get("/", (req,res)=> { 
  res.send("Sever is live"); 
})
app.use('/api/user', userRouter); 

const PORT = process.env.PORT || 3000; 
app.listen(PORT , ()=> {
  console.log("server is running on http://localhost:3000")
})