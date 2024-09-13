import express,{Request , Response} from 'express';
import dotenv from 'dotenv';
import prisma from "./prisma/index"
import cors from 'cors';

import UserRoutes from './Routes/UserRoutes';
import NewsRoute from './Routes/NewsRoute';

dotenv.config();
const app = express();
app.use(cors());

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from TypeScript backend!');
  });

app.get('/api/test-db', async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany();
      res.json({ message: 'Database connection is successful!', users });
    } catch (error) {
      res.status(500).json({ error: 'Database connection failed.', details: error });
    }
  });


app.use('/api/user',UserRoutes);
app.use('/api/news', NewsRoute);


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});