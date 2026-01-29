const fs = require('fs');
const path = require('path');

// 更新 js/data.js 文件
function updateDataJs() {
    const dataDir = path.join(__dirname, '..', 'data');
    const outputPath = path.join(__dirname, '..', 'js', 'data.js');

    const allData = {};

    // 读取所有 JSON 文件
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

    files.forEach(file => {
        const dateStr = file.replace('.json', '');
        const filePath = path.join(dataDir, file);

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            allData[dateStr] = JSON.parse(content);
        } catch (error) {
            console.error(`Error reading ${file}:`, error);
        }
    });

    // 按日期排序
    const sortedData = {};
    Object.keys(allData).sort().forEach(key => {
        sortedData[key] = allData[key];
    });

    // 写入 data.js
    const output = 'const ALL_DATA = ' + JSON.stringify(sortedData, null, 2) + ';';
    fs.writeFileSync(outputPath, output, 'utf8');

    console.log(`Updated data.js with ${Object.keys(sortedData).length} days of data`);
}

updateDataJs();
