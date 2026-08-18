const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    const absPath = path.resolve('index.html').replace(/\\/g, '/');
    await page.goto('file:///' + absPath, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    // Scroll through the page to trigger any lazy/scroll animations
    await page.evaluate(async () => {
        await new Promise(resolve => {
            let totalHeight = 0;
            const distance = 400;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 500));

    // Get the full page height
    const bodyHandle = await page.$('body');
    const { height } = await bodyHandle.boundingBox();

    await page.pdf({
        path: 'דף-נחיתה-לאישור.pdf',
        width: '1440px',
        height: (height + 40) + 'px',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '0px', right: '0px' },
        scale: 1
    });
    await browser.close();
    console.log('PDF saved successfully! Height:', height);
})();
