import express from "express";
import { authenticate } from "../firebase.js";
import {
  addCollectible,
  addCollectibleList,
  addSubcategories,
  getCollectibleTypes,
  getSubcategories,
  getCollectiblesByName,
  deleteCollectibleType,
} from "../controllers/collectibleController.js";

const collectibleRouter = express.Router();

// Add Collectible List endpoint with authentication
collectibleRouter.post("/addCollectibleList", authenticate, addCollectibleList);

// Add Subcategories endpoint with authentication
collectibleRouter.post("/addSubcategories", authenticate, addSubcategories);

// Add Collectible endpoint with authentication
collectibleRouter.post("/addCollectible", authenticate, addCollectible);

// Get Collectible Types endpoint with authentication
collectibleRouter.post(
  "/getCollectibleTypes",
  authenticate,
  getCollectibleTypes
);
collectibleRouter.post("/getSubcategories", authenticate, getSubcategories);
collectibleRouter.post("/getcollectiblesByName", getCollectiblesByName);

collectibleRouter.delete(
    "/collectibles/:collectibleType/:subcategory/:collectibleName",
    deleteCollectibleType
  );
  
  collectibleRouter.delete(
    "/collectibles/:collectibleType/:subcategory",
    deleteCollectibleType
  );
  
  collectibleRouter.delete(
    "/collectibles/:collectibleType",
    deleteCollectibleType
  );
export default collectibleRouter;
