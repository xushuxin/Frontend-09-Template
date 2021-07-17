const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8080/main.html');//要测试的页面地址

    const a = await page.$('.carousel');//$ === document.querySelector
    console.log(await a.asElement().boxModel())

    const imgs = await page.$$('.carousel > div');//$$ === document.querySelectorAll
    console.log(imgs);
    await browser.close();
})();