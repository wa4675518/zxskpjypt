const { chromium } = require('playwright');

// 已知的一些high-profile高校对应的college_id（从spark/list里的college_site_id推断）
// college_site_id: 534=云南大学, 599=华中农业大学, 553=中南大学, etc.
// 我们需要找北大(PKU)、清华(THU)等

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 先试试 college子站点
  // 尝试北京大学的college_id
  const testUrls = [
    'https://gxxhg-kp.cast.org.cn/front/collegeHome?id=1',    // 尝试id=1
    'https://gxxhg-kp.cast.org.cn/front/collegeHome?id=100',
    'https://gxxhg-kp.cast.org.cn/front/collegeHome?id=500',
    'https://gxxhg-kp.cast.org.cn/front/collegeHome?id=534',  // 云南大学
    'https://gxxhg-kp.cast.org.cn/front/collegeHome?id=599',  // 华中农业大学
  ];
  
  await page.goto('https://gxxhg-kp.cast.org.cn/front/home', { waitUntil: 'domcontentloaded', timeout: 15000 });
  
  // 尝试搜索北京大学
  const searchData = await page.evaluate(async () => {
    const apis = [
      '/fapi/college/getCollegeList?page=1&page_size=50',
      '/fapi/common/collegeList',
      '/fapi/site/list',
      '/fapi/college/info?id=1',
    ];
    const results = [];
    for (const api of apis) {
      try {
        const res = await fetch('https://gxxhg-kp.cast.org.cn' + api);
        const text = await res.text();
        results.push({ api, status: res.status, text: text.substring(0, 800) });
      } catch(e) {
        results.push({ api, error: e.message });
      }
    }
    return results;
  });
  
  console.log('=== API探测 ===');
  searchData.forEach(d => console.log(JSON.stringify(d)));
  
  // 访问高校子站点并抓logo
  for (const url of testUrls) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    const imgs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter(img => img.src && !img.src.startsWith('data:'))
        .map(img => ({ src: img.src, alt: img.alt, class: img.className }));
    });
    const title = await page.title();
    console.log(`\n=== ${url} ===`);
    console.log('Title:', title);
    imgs.forEach(img => console.log(JSON.stringify(img)));
  }
  
  await browser.close();
})();
