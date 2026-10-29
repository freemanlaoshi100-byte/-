import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'knowledge-manager-server',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const rawUrl = req.url || '';

            // 1. 处理上传保存知识点 HTML API
            if (req.method === 'POST' && rawUrl.startsWith('/api/upload-knowledge')) {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  const { name, content } = data;
                  if (!name || typeof content !== 'string') {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Missing name or content' }));
                    return;
                  }
                  const safeName = path.basename(name).replace(/\.html$/, '');
                  const filePath = path.resolve(__dirname, 'public/knowledge', `${safeName}.html`);
                  fs.writeFileSync(filePath, content, 'utf-8');

                  res.setHeader('Content-Type', 'application/json');
                  res.end(
                    JSON.stringify({
                      success: true,
                      message: `已成功保存知识点【${safeName}】的内容文件`,
                      path: `./knowledge/${encodeURIComponent(safeName)}.html`,
                    })
                  );
                } catch (err: any) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: err?.message || 'Server error' }));
                }
              });
              return;
            }

            // 2. 拦截并服务知识点 HTML 资源（支持 root 和分类子目录）
            if (rawUrl.includes('/knowledge/')) {
              try {
                const decoded = decodeURIComponent(rawUrl.split('?')[0]);
                const fileName = path.basename(decoded);
                
                // 优先检查根目录
                let filePath = path.resolve(__dirname, 'public/knowledge', fileName);
                if (fs.existsSync(filePath)) {
                  res.setHeader('Content-Type', 'text/html; charset=utf-8');
                  fs.createReadStream(filePath).pipe(res);
                  return;
                }

                // 检查子分类文件夹
                const subDirs = ['数与代数', '图形与几何', '统计与概率', '综合与实践', 'templates'];
                for (const sub of subDirs) {
                  const candidate = path.resolve(__dirname, 'public/knowledge', sub, fileName);
                  if (fs.existsSync(candidate)) {
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    fs.createReadStream(candidate).pipe(res);
                    return;
                  }
                }
              } catch (e) {
                // pass to next
              }
            }

            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
