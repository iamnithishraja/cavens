import type { Request, Response } from 'express';
import { generateUploadUrlProfile } from "../utils/fileUpload";
import { v4 as uuidv4 } from 'uuid';

export const getClubUploadUrl = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fileType, fileName, isPermanent } = req.body;

        if (!fileType || !fileName) {
            res.status(400).json({ message: 'File type and name are required' });
            return;
        }

        // Generate a presigned URL for uploading
        const { uploadUrl, publicUrl } = await generateUploadUrlProfile(
            fileType,
            fileName,
            'files',
            uuidv4(),
            isPermanent || false
        );

        res.status(200).json({ uploadUrl, publicUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
