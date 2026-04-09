const { chromium } = require('playwright');

async function scrapeAll() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const results = {};

  // ===== 1. 中学生英才计划 =====
  console.log('\n===== 抓取：中学生英才计划 =====');
  try {
    const page1 = await context.newPage();
    await page1.goto('https://zxsycjh-kp.cast.org.cn/front/home', { waitUntil: 'networkidle', timeout: 30000 });
    await page1.waitForTimeout(3000);
    
    const html1 = await page1.content();
    const text1 = await page1.evaluate(() => document.body.innerText);
    console.log('英才计划页面文字（前3000字）:');
    console.log(text1.substring(0, 3000));
    
    // 尝试抓取具体内容
    const items1 = await page1.evaluate(() => {
      const result = {};
      
      // 抓取所有标题类内容
      const titles = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,.title,.name,.subject,.card-title,.item-title'))
        .map(el => el.innerText.trim()).filter(t => t.length > 1);
      result.titles = [...new Set(titles)].slice(0, 30);
      
      // 抓取列表/卡片文字
      const cards = Array.from(document.querySelectorAll('.card,.item,.list-item,.news-item,.activity-item,.resource-item'))
        .map(el => el.innerText.trim().substring(0, 200)).filter(t => t.length > 5);
      result.cards = cards.slice(0, 20);
      
      // 抓取所有链接文字
      const links = Array.from(document.querySelectorAll('a'))
        .map(el => el.innerText.trim()).filter(t => t.length > 2 && t.length < 50);
      result.links = [...new Set(links)].slice(0, 50);
      
      // 导航/分类
      const navItems = Array.from(document.querySelectorAll('nav a, .nav-item, .menu-item, .tab-item'))
        .map(el => el.innerText.trim()).filter(t => t.length > 1);
      result.navItems = [...new Set(navItems)].slice(0, 20);

      return result;
    });
    console.log('英才计划数据:', JSON.stringify(items1, null, 2));
    results.yingcai = items1;
    await page1.close();
  } catch(e) {
    console.error('英才计划抓取失败:', e.message);
    results.yingcai = { error: e.message };
  }

  // ===== 2. 高校科学营 =====
  console.log('\n===== 抓取：高校科学营 =====');
  try {
    const page2 = await context.newPage();
    await page2.goto('https://kexueying-kp.cast.org.cn/front/home', { waitUntil: 'networkidle', timeout: 30000 });
    await page2.waitForTimeout(3000);
    
    const text2 = await page2.evaluate(() => document.body.innerText);
    console.log('科学营页面文字（前3000字）:');
    console.log(text2.substring(0, 3000));
    
    const items2 = await page2.evaluate(() => {
      const result = {};
      const titles = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,.title,.name,.subject,.card-title,.item-title'))
        .map(el => el.innerText.trim()).filter(t => t.length > 1);
      result.titles = [...new Set(titles)].slice(0, 30);
      
      const cards = Array.from(document.querySelectorAll('.card,.item,.list-item,.news-item,.activity-item,.camp-item'))
        .map(el => el.innerText.trim().substring(0, 200)).filter(t => t.length > 5);
      result.cards = cards.slice(0, 20);
      
      const links = Array.from(document.querySelectorAll('a'))
        .map(el => el.innerText.trim()).filter(t => t.length > 2 && t.length < 50);
      result.links = [...new Set(links)].slice(0, 50);
      
      return result;
    });
    console.log('科学营数据:', JSON.stringify(items2, null, 2));
    results.kexueying = items2;
    await page2.close();
  } catch(e) {
    console.error('科学营抓取失败:', e.message);
    results.kexueying = { error: e.message };
  }

  // ===== 3. 高校星火馆 =====
  console.log('\n===== 抓取：高校星火馆 =====');
  try {
    const page3 = await context.newPage();
    await page3.goto('https://gxxhg-kp.cast.org.cn/front/home', { waitUntil: 'networkidle', timeout: 30000 });
    await page3.waitForTimeout(3000);
    
    const text3 = await page3.evaluate(() => document.body.innerText);
    console.log('星火馆页面文字（前3000字）:');
    console.log(text3.substring(0, 3000));
    
    const items3 = await page3.evaluate(() => {
      const result = {};
      const titles = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,.title,.name,.subject,.card-title,.item-title'))
        .map(el => el.innerText.trim()).filter(t => t.length > 1);
      result.titles = [...new Set(titles)].slice(0, 30);
      
      const cards = Array.from(document.querySelectorAll('.card,.item,.list-item,.news-item,.activity-item,.museum-item,.venue-item'))
        .map(el => el.innerText.trim().substring(0, 200)).filter(t => t.length > 5);
      result.cards = cards.slice(0, 20);
      
      const links = Array.from(document.querySelectorAll('a'))
        .map(el => el.innerText.trim()).filter(t => t.length > 2 && t.length < 50);
      result.links = [...new Set(links)].slice(0, 50);
      
      return result;
    });
    console.log('星火馆数据:', JSON.stringify(items3, null, 2));
    results.xinghuo = items3;
    await page3.close();
  } catch(e) {
    console.error('星火馆抓取失败:', e.message);
    results.xinghuo = { error: e.message };
  }

  await browser.close();
  
  // 保存结果
  const fs = require('fs');
  fs.writeFileSync('/Users/ao/WorkBuddy/20260324173254/scraped_data.json', JSON.stringify(results, null, 2));
  console.log('\n✅ 数据已保存到 scraped_data.json');
}

scrapeAll().catch(console.error);
