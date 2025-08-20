import express from 'express';
import { getClubUploadUrl } from '../controllers/fileController';

const router = express.Router();

router.post('/upload-url',  getClubUploadUrl);

export default router;