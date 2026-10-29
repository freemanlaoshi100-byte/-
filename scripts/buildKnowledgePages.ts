import fs from 'fs';
import path from 'path';
import { ALL_MATH_ITEMS } from '../src/data/rawMathData.ts';
import { generateKnowledgeHtml } from '../src/utils/generateKnowledgeHtml.ts';

const outDir = path.resolve(process.cwd(), 'public/knowledge');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log(`Starting to generate ${ALL_MATH_ITEMS.length} knowledge HTML pages...`);

let count = 0;
for (const item of ALL_MATH_ITEMS) {
  const fileName = `${item.name}.html`;
  const filePath = path.join(outDir, fileName);
  const htmlContent = generateKnowledgeHtml(item);
  fs.writeFileSync(filePath, htmlContent, 'utf-8');
  count++;
}

console.log(`Successfully generated ${count} HTML files in ${outDir}`);
