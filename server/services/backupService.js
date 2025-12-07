const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');

const BACKUP_DIR = path.join(__dirname, '../backups');

// Ensure backup directory exists
(async () => {
    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
    } catch (err) {
        console.error('Error creating backup dir:', err);
    }
})();

const triggerBackup = async () => {
    const date = new Date();
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyBackupDir = path.join(BACKUP_DIR, dateString);

    console.log(`[Backup] Triggered for ${dateString}...`);

    try {
        await fs.mkdir(dailyBackupDir, { recursive: true });

        // The original code had a mongoose connection check here, but the requested change removes it.
        // if (mongoose.connection.readyState !== 1) {
        //     console.error('[Backup] Database not connected!');
        //     return;
        // }

        const collections = await mongoose.connection.db.listCollections().toArray();

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            const collection = mongoose.connection.db.collection(collectionName);
            const data = await collection.find({}).toArray();

            const filePath = path.join(dailyBackupDir, `${collectionName}.json`);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            // console.log(`[Backup] Updated ${collectionName} in ${filePath}`);
        }

        console.log(`[Backup] Completed successfully for ${dateString}.`);
    } catch (error) {
        console.error('[Backup] Failed:', error);
    }
};

module.exports = {
    triggerBackup
};
