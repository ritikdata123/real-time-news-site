import express ,{Response, Request} from 'express';
import * as bcrypt from 'bcrypt';
import Jwt  from 'jsonwebtoken';

import prisma from '../prisma';

const register = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    console.log(req.body)
  
    try {
      const ifuser = await prisma.user.findUnique({
        where: { email }
      });
  
      if (ifuser) {
        return res.status(400).json({ message: 'email id already exists' });
      }
  
      const hashpass = await bcrypt.hash(password, 10);
  
      const newuser = await prisma.user.create({
        data: {
          email,
          password: hashpass,  
          name
        },
      });

      res.status(200).json({ message: 'Account created successfully', user: newuser });
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: 'User registration failed'});
    }
  };

  const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(404).json({ error: "User not found" });
  
      const pass = await bcrypt.compare(password, user.password);
      if (!pass) return res.status(401).json({ error: "Invalid credentials" });
  
      const token = Jwt.sign({ userId: user.id }, "defaultsecret", {
        expiresIn: '1h',
      });
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      res.status(500).json({ error: "Login failed", details: error });
    }
  };

  export {register , login};