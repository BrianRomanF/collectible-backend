// userController.js
import UserModel from '../schemas/user.js';
import CollectibleModel from '../schemas/collectible.js';
import { addCollectibleDefault } from './collectibleController.js';

const userController = {
  createUser: async (req, res) => {
    try {
      // Extract user data from the request body
      const { userId, displayName } = req.body;

      // Check if user with the provided userId already exists
      const existingUser = await UserModel.findOne({ userId });

      if (existingUser) {
        return res.status(400).json({ error: 'User with this userId already exists' });
      }

      // Create a new user
      const newUser = await UserModel.create({ userId, displayName });

      // Create default collectibles for the new user
      const defaultCollectibles = [
        { type: 'comics', typeImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOyhwOwbivQI1O2ecYdFYDIrPo_OWL1BK1EQ&usqp=CAU' },
        { type: 'figures', typeImg: 'https://images.bigbadtoystore.com/site-images/p/2022/09/1611a3b5-3f7b-4130-b4dd-ff3b81fbfc91.jpg' },
        { type: 'games', typeImg: 'https://i.pinimg.com/474x/dc/ba/6c/dcba6ce75897093f4b66b1dab828e0fc.jpg' },
        { type: 'vinyls', typeImg: 'https://images.radio.com/aiu-media/Vinyl081219-a61f1b21-2a49-4909-a503-92541de79834.jpg' },
      ];

      for (const collectible of defaultCollectibles) {
        const result = await addCollectibleDefault(newUser.userId, collectible.type, collectible.typeImg);
        if (result.error) {
          console.error(`Failed to create default collectible for type ${collectible.type}: ${result.error}`);
        }
      }

      // Send response
      res.status(201).json({
        user: newUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

export default userController;
