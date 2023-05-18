import { F_OK } from 'fs';
import { writeFile, unlink, access } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Report {
    constructor(list) {
        this.list = list;
    }

    async writeToDisk(fileName) {
        let first = new Date().getTime();
        let last = 0;

        const numbersGenerated = this.list.map(it => {
            if (first > it.time) first = it.time;
            if (last < it.time) last = it.time;

            return it.value;
        });
        const filePath = `${__dirname}/../${fileName}.json`;
        try {
            if (await access(filePath, F_OK)) {
                await unlink(filePath);
            }
        } catch {}

        await writeFile(filePath, JSON.stringify({
            timeSpent: last - first,
            numbersGenerated
        }, null, 4));
    }
}
