import puppeteer from 'puppeteer';
(async () => {
    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
        page.on('requestfailed', request => console.log('FAILED REQUEST:', request.url(), request.failure().errorText));
        await page.goto('http://127.0.0.1:8001/login', {waitUntil: 'networkidle0'});
        await browser.close();
    } catch(err) { console.error('PUPPETEER ERROR:', err) }
})();
