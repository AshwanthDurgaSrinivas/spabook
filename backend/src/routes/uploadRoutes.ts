import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.post('/image', authenticateJWT, upload.single('image'), (req: any, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the file path or URL
        const filePath = `/uploads/${req.file.filename}`;
        res.json({
            message: 'Image uploaded successfully',
            url: filePath
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

router.post('/document', upload.single('document'), (req: any, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({
            message: 'Document uploaded successfully',
            url: `/uploads/${req.file.filename}`
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
});

export default router;
