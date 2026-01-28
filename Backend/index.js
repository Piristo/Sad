import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();



import UserModel from './models/user.js';



const app = express();
const PORT = process.env.PORT || 4444;

// MongoDB connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to the API',
    status: 'Server is running',
  });
});



// вход пользователя в аппку
app.post('/api/enter', async (req, res) => {   
  try {
    const { tlgid } = req.body;

    const user = await UserModel.findOne({ tlgid: tlgid });

    //создание юзера
    if (!user) {
      const createresponse = await createNewUser(tlgid);

      // if (!createresponse) {
      //   throw new Error('ошибка в функции createNewUser');
      // }

      if (createresponse.status == 'created') {
        const userData = {};
        console.log('showOnboarding')
        userData.result = 'showOnboarding';
        return res.json({ userData });
      }
    }

    // извлечь инфо о юзере из БД и передать на фронт действие
    const { _id, ...userData } = user._doc;
    userData.result = 'showIndexPage';
    console.log('showIndexPage')
    return res.json({ userData });
  } catch (err) {
    // logger.error({
    //       title: 'Error in endpoint /system/enter', 
    //       message: err.message,
    //       dataFromServer: err.response?.data,
    //       statusFromServer: err.response?.status,
    //     }); 
  }
  return res.json({ statusBE: 'notOk' });
});





// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Mock response if no key
      return res.json({ 
        reply: `[MOCK MODE] Я получил ваше сообщение: "${message}". Чтобы я мог отвечать по-настоящему, добавьте OPENAI_API_KEY в .env файл на сервере.` 
      });
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Ты - умный агроном-помощник. Твоя задача - помогать пользователям с вопросами по садоводству, огороду, уходу за растениями. Давай краткие, точные и полезные советы. Используй дружелюбный тон." },
        { role: "user", content: message }
      ],
      model: "gpt-3.5-turbo",
    });

    return res.json({ 
      reply: completion.choices[0].message.content 
    });

  } catch (err) {
    console.error('Chat API Error:', err);
    return res.status(500).json({ error: 'Failed to process chat message' });
  }
});

async function createNewUser(tlgid) {
  try {
    const doc = new UserModel({
      tlgid: tlgid,
      
    });

    const user = await doc.save();

    if (!user) {
      throw new Error('ошибка при создании пользователя в бд UserModel');
    }

    return { status: 'created' };
  } catch (err) {
    return false;
  }
}





// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});
