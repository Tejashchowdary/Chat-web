import express from 'express';
import { uploadFile, upload } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadFile);

export default router;