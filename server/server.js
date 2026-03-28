import express from 'express'; 
import 'dotenv/config'; 
import cors from 'cors'; 


const app = express(); 

//Middleware 
app.use(cors()); 
app.use(express.json()); 

// Router
app.get("/", (req,res)=> { 
  res.send("Sever is live"); 
})

const PORT = process.env.PORT || 3000; 
app.listen(PORT , ()=> {
  console.log("server is running on http://localhost:3000")
})