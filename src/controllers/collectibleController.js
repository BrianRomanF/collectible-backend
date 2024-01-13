// collectibleController.js
import CollectibleModel from "../schemas/collectible.js";
import UserModel from "../schemas/user.js";


const addCollectibleDefault = async (userId, collectibleType, typeImg) => {
  try {
    // Find the user with the provided userId
    const user = await UserModel.findOne({ userId });

    if (!user) {
      return { error: 'User not found with the provided userId' };
    }

    // Ensure collectibleType is always an array
    const collectibleTypes = Array.isArray(collectibleType) ? collectibleType : [collectibleType];

    // Check if collectibleType already exists for the user
    const existingCollectibles = await CollectibleModel.find({
      user: user._id,
      'collectibleType.type': { $in: collectibleTypes },
    });

    if (existingCollectibles && existingCollectibles.length > 0) {
      return { error: 'Collectible type already exists for the user' };
    }

    // Create a new collectible for the found user
    const collectiblesToCreate = collectibleTypes.map(type => ({
      user: user._id,
      userId: user.userId,
      collectibleType: [{ type, typeImg, subcategories: [] }],
    }));

    // Create only the collectibles that do not already exist
    const createdCollectibles = await CollectibleModel.create(collectiblesToCreate);

    return {
      message: 'Collectible added successfully',
      collectibles: createdCollectibles,
    };
  } catch (error) {
    console.error(error);
    return { error: 'Internal Server Error' };
  }
};

const addCollectibleList = async (req, res) => {
  try {
    const { userId, collectibleType , typeImg} = req.body;

    // Find the user with the provided userId
    const user = await UserModel.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found with the provided userId' });
    }

    // Ensure collectibleType is always an array
    const collectibleTypes = Array.isArray(collectibleType) ? collectibleType : [collectibleType];

    // Check if collectibleType already exists for the user
    const existingCollectibles = await CollectibleModel.find({
      user: user._id,
      'collectibleType.type': { $in: collectibleTypes },
    });

    if (existingCollectibles && existingCollectibles.length > 0) {
      return res.status(400).json({ error: 'Collectible type already exists for the user' });
    }

    // Create a new collectible for the found user
    const collectiblesToCreate = collectibleTypes.map(type => ({
      user: user._id,
      userId: user.userId,
      collectibleType: [{ type,typeImg, subcategories: [] }],
    }));

    // Create only the collectibles that do not already exist
    const createdCollectibles = await CollectibleModel.create(collectiblesToCreate);

    res.status(201).json({
      message: 'Collectible added successfully',
      collectibles: createdCollectibles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const addSubcategories = async (req, res) => {
  try {
    const { userId, collectibleType, subcategories } = req.body;


    // Find the user with the provided userId
    const user = await UserModel.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: "User not found with the provided userId" });
    }

    // Find any collectible for the user where collectibleType matches exactly
    const collectible = await CollectibleModel.findOne({
      user: user._id,
      "collectibleType.type": collectibleType,
    });

    // Check if the found collectible has the correct collectibleType
    if (collectible) {
      // Add the subcategories to the collectibleType
      collectible.collectibleType = collectible.collectibleType || [];

      // Find the index of collectibleType in the array
      const collectibleTypeIndex = collectible.collectibleType.findIndex(ct => ct.type === collectibleType);

      if (collectibleTypeIndex !== -1) {
        // If collectibleType already exists, add the subcategories
        collectible.collectibleType[collectibleTypeIndex].subcategories = collectible.collectibleType[collectibleTypeIndex].subcategories || [];

        // Check for duplicate subcategories
        const duplicates = subcategories.filter(newSubcategory => {
          return collectible.collectibleType[collectibleTypeIndex].subcategories.some(existingSubcategory =>
            existingSubcategory.subcategory === newSubcategory.subcategory
          );
        });

        if (duplicates.length > 0) {
          return res.status(400).json({
            error: "Subcategories already exist for the provided collectibleType",
            duplicates: duplicates,
          });
        }

        // Add non-duplicate subcategories
        subcategories.forEach(newSubcategory => {
          collectible.collectibleType[collectibleTypeIndex].subcategories.push(newSubcategory);
        });

        // Save the updated collectible to the database
        await collectible.save();

        return res.status(200).json({
          message: "Subcategories added successfully",
          collectible: collectible,
        });
      }
    }

    // Collectible not found
    return res.status(404).json({
      error: "Collectible not found with the provided collectibleType",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// import necessary modules

const addCollectible = async (req, res) => {
  try {
    const { userId, collectibleType, subcategory } = req.body;

    // Find the user with the provided userId
    const user = await UserModel.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found with the provided userId' });
    }

    // Ensure collectibleType is always an array
    const collectibleTypes = Array.isArray(collectibleType) ? collectibleType : [collectibleType];

    // Check if any collectibleType already exists for the user
    const existingCollectibles = await CollectibleModel.find({
      user: user._id,
      'collectibleType.type': { $in: collectibleTypes },
    });

    if (existingCollectibles && existingCollectibles.length > 0) {
      // Add collectibles to existing types
      const updatedCollectibles = await Promise.all(
        existingCollectibles.map(async collectible => {
          const updatedCollectibleType = collectible.collectibleType.map(collectibleType => {
            if (collectibleTypes.includes(collectibleType.type)) {
              // Check if subcategory already exists
              const existingSubcategory = collectibleType.subcategories.find(
                existing => existing.subcategory === subcategory.name
              );

              if (existingSubcategory) {
                // Subcategory exists, add the collectible to it
                existingSubcategory.collectibles.push(...(subcategory.collectibles || []));
              } else {
                // Subcategory does not exist, create a new one
                collectibleType.subcategories.push({
                  subcategory: subcategory.name,
                  collectibles: subcategory.collectibles || [],
                });
              }
            }

            return collectibleType;
          });

          // Update the existing collectible with the new information
          return await CollectibleModel.findByIdAndUpdate(
            collectible._id,
            { 'collectibleType': updatedCollectibleType },
            { new: true }
          );
        })
      );

      res.status(201).json({
        message: 'Collectible added successfully',
        collectibles: updatedCollectibles,
      });
    } else {
      // If no existing collectibles, create new ones
      const createdCollectibles = await CollectibleModel.create(
        collectibleTypes.map(type => ({
          user: user._id,
          userId: user.userId,
          collectibleType: [
            {
              type,
              subcategories: [
                {
                  subcategory: subcategory.name,
                  collectibles: subcategory.collectibles || [],
                },
              ],
            },
          ],
        }))
      );

      res.status(201).json({
        message: 'Collectible added successfully',
        collectibles: createdCollectibles,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getCollectibleTypes = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the user with the provided userId
    const user = await UserModel.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found with the provided userId' });
    }

    // Retrieve collectible types for the user
    const collectibles = await CollectibleModel.find({ user: user._id });

    const collectibleTypes = collectibles.reduce((acc, collectible) => {
      collectible.collectibleType.forEach((type) => {
        acc[type.type] = acc[type.type] || { typeImg: type.typeImg, subcategories: [] };
      });
      return acc;
    }, {});

    res.status(200).json({
      userId: user.userId,
      collectibleTypes: Object.entries(collectibleTypes).map(([type, { typeImg }]) => ({ type, typeImg })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getSubcategories = async (req, res) => {
  try {
    const { userId, collectibleType } = req.body;

    // Find the user with the provided userId
    const user = await UserModel.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found with the provided userId' });
    }

    // Find the collectible for the user and specified collectibleType
    const collectible = await CollectibleModel.findOne({
      user: user._id,
      'collectibleType.type': collectibleType,
    });

    if (!collectible) {
      return res.status(404).json({
        error: 'Collectible not found with the provided collectibleType',
      });
    }

    // Extract subcategories for the specified collectibleType
    const subcategories = collectible.collectibleType
      .find((type) => type.type === collectibleType)
      .subcategories;

    res.status(200).json({
      userId: user.userId,
      collectibleType,
      subcategories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getCollectiblesByName = async (req, res) => {
  try {
    const { userId, collectibleType, subcategory } = req.body;

    // Find the user with the provided userId
    const user = await UserModel.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found with the provided userId' });
    }

    // Find all collectibles for the user, specified collectibleType, and subcategory
    const collectibles = await CollectibleModel.find({
      user: user._id,
      $and: [
        { 'collectibleType.type': collectibleType },
        { 'collectibleType.subcategories.subcategory': subcategory.name },
      ],
    });

    if (!collectibles || collectibles.length === 0) {
      return res.status(404).json({
        error: 'Collectibles not found with the provided collectibleType and subcategory',
      });
    }

    // Extract collectibles for the specified collectibleType and subcategory
    const matchingCollectibles = collectibles.map(collectible => {
      const collectibleTypeData = collectible.collectibleType.find(type => type.type === collectibleType);
      const subcategoryData = collectibleTypeData.subcategories.find(sub => sub.subcategory === subcategory.name);

      return {
        userId: user.userId,
        collectibleType,
        subcategory: subcategory.name,
        collectibles: subcategoryData.collectibles,
      };
    });

    res.status(200).json(matchingCollectibles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteCollectibleType = async (req, res) => {
  try {
    const { collectibleType, subcategory, collectibleName } = req.params;

    const query = { 'collectibleType.type': collectibleType };

    // If subcategory and collectibleName are provided, delete only that collectible
    if (subcategory && collectibleName) {
      const updatedCollectible = await CollectibleModel.findOneAndUpdate(
        query,
        {
          $pull: {
            'collectibleType.$[type].subcategories.$[sub].collectibles': {
              CollectibleName: collectibleName
            },
          },
        },
        {
          arrayFilters: [
            { 'type.type': collectibleType },
            { 'sub.subcategory': subcategory },
          ],
          new: true,
        }
      );

      if (!updatedCollectible) {
        return res.status(404).json({
          error: 'Collectible not found with the provided type, subcategory, and CollectibleName'
        });
      }

      return res.status(200).json({
        message: 'Collectible deleted successfully',
        updatedCollectible,
      });
    }

    // If only subcategory is provided, delete only that subcategory
    if (subcategory) {
      const updatedCollectible = await CollectibleModel.findOneAndUpdate(
        query,
        {
          $pull: {
            'collectibleType.$[type].subcategories': { subcategory },
          },
        },
        {
          arrayFilters: [
            { 'type.type': collectibleType },
          ],
          new: true,
        }
      );

      if (!updatedCollectible) {
        return res.status(404).json({
          error: 'Collectible not found with the provided type and subcategory'
        });
      }

      return res.status(200).json({
        message: 'Subcategory deleted successfully',
        updatedCollectible,
      });
    }

    // If subcategory and collectibleName are not provided, delete the entire collectibleType
    const deletedCollectible = await CollectibleModel.findOneAndDelete(query);

    if (!deletedCollectible) {
      return res.status(404).json({
        error: 'Collectible not found with the provided type'
      });
    }

    res.status(200).json({
      message: 'Collectible deleted successfully',
      deletedCollectible,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};









export { addCollectibleDefault, addCollectible, addCollectibleList, addSubcategories, getCollectibleTypes, getSubcategories, getCollectiblesByName, deleteCollectibleType };
