const fs = require('fs');
const path = require('path');

// Từ khóa cần rà soát lại (cả tiếng Việt và tiếng Anh)
const keywords = [
  'cứu bánh', 'hết hạn', 'cận date', 'thanh lý', 'xả hàng', 'giải cứu',
  'momo', 'test', 'demo', 'cũ', 'bánh ế', 'lỗi', 'todo', 'fixme',
  'thử nghiệm', 'giả lập', 'webhook'
];

function scanFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Bỏ qua các thư mục không cần thiết
    if (['node_modules', '.git', 'target', '.gemini', 'dist', 'build', '.idea'].includes(entry.name)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      scanFiles(fullPath);
    } else if (/\.(tsx|ts|java|html|md|properties|js)$/.test(entry.name)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          const lower = line.toLowerCase();
          for (const kw of keywords) {
            // Kiểm tra xem dòng có chứa từ khóa nhưng không phải là comment hoặc console
            if (lower.includes(kw) && !line.includes('//') && !line.includes('*') && !line.includes('console.')) {
              // Bỏ qua các trường hợp phổ biến không phải là text hiển thị
              if (kw === 'test' && (lower.includes('testing') || lower.includes('latest') || lower.includes('contest'))) return;
              
              console.log(`${fullPath}:${index + 1} [${kw}] -> ${line.trim().slice(0, 100)}`);
              break;
            }
          }
        });
      } catch (e) {}
    }
  }
}

console.log('--- Bắt đầu rà soát Text ---');
scanFiles('.');
console.log('--- Kết thúc rà soát ---');
