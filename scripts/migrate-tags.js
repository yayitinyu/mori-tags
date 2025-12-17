import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TAGS_DIR = path.resolve(__dirname, '../legacy_reference/tags');
const OUTPUT_FILE = path.resolve(__dirname, '../seed.sql');

const sqlStatements = [];

// Helper to escape SQL strings
const escape = (str) => {
    if (!str) return 'NULL';
    return `'${str.replace(/'/g, "''")}'`;
};

function processFile(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = yaml.load(fileContent);

        if (!data || !data.content) return;

        const category = data.name || 'Uncategorized';

        // Check if content is array or object
        // Based on inspection, it seems to be an object where keys are English tags
        const content = data.content;

        for (const [tagEn, details] of Object.entries(content)) {
            const nameZh = details.name || '';
            const wikiUrl = details.wikiURL || '';
            const imageUrl = details.image || '';
            const isNegative = false; // Default, user can change later or we infer from category?

            // Construct INSERT statement
            // columns: name_en, name_zh, category, is_negative, image_url, wiki_url
            const sql = `INSERT INTO tags (name_en, name_zh, category, is_negative, image_url, wiki_url) VALUES (${escape(tagEn)}, ${escape(nameZh)}, ${escape(category)}, ${isNegative ? 1 : 0}, ${escape(imageUrl)}, ${escape(wikiUrl)});`;
            sqlStatements.push(sql);
        }
    } catch (e) {
        console.error(`Error processing ${filePath}:`, e);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.yaml') || file.endsWith('.yml')) {
            processFile(fullPath);
        }
    }
}

console.log('Starting migration...');
walkDir(TAGS_DIR);

const finalSql = sqlStatements.join('\n');
fs.writeFileSync(OUTPUT_FILE, finalSql);
console.log(`Migration complete. Generated ${sqlStatements.length} tags in ${OUTPUT_FILE}`);
