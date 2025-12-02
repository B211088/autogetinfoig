
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractInfo') {
    try {
      const data = extractProfileInfo();
      sendResponse({ success: true, data });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  } else if (request.action === 'fillBirthday') {
    try {
      fillBirthdayFields();
      sendResponse({ success: true, message: 'Đã điền ngày sinh và bấm Next' });
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }
  return true;
});

function extractProfileInfo() {

  let username = '';
  const urlMatch = window.location.pathname.match(/^\/([^\/]+)/);
  if (urlMatch) {
    username = urlMatch[1];
  }
  
 
  if (!username) {
    const headerSpans = document.querySelectorAll('header span');
    for (const span of headerSpans) {
      const text = span.textContent.trim();
      if (text && text.length > 0 && text.length < 50 && !text.includes(' ')) {
        username = text;
        break;
      }
    }
  }
  
  if (!username) {
    throw new Error('Không tìm thấy username. Vui lòng mở trang profile Instagram.');
  }
  
  let posts = '0';
  let followers = '0';
  let following = '0';
  
  
  const headerText = document.querySelector('header')?.innerText || '';
  
  const postMatch = headerText.match(/(\d+[\d,\.KMB]*)\s*post/i);
  const followerMatch = headerText.match(/(\d+[\d,\.KMB]*)\s*follower/i);
  const followingMatch = headerText.match(/(\d+[\d,\.KMB]*)\s*following/i);
  
  if (postMatch) posts = postMatch[1].replace(/,/g, '');
  if (followerMatch) followers = followerMatch[1].replace(/,/g, '');
  if (followingMatch) following = followingMatch[1].replace(/,/g, '');
  

  if (posts === '0' || followers === '0' || following === '0') {
    const listItems = document.querySelectorAll('header ul li, header section ul li');
    
    listItems.forEach(li => {
      const text = li.textContent.trim().toLowerCase();
      const numbers = text.match(/\d+[\d,]*/g);
      
      if (numbers && numbers.length > 0) {
        const num = numbers[0].replace(/,/g, '');
        
        if ((text.includes('post') || text.includes('bài viết')) || text.includes('posts') && posts === '0') {
          posts = num;
        } else if ((text.includes('follower') || text.includes('followers') || text.includes('người theo dõi')) && followers === '0') {
          followers = num;
        } else if ((text.includes('following') || text.includes('đang theo dõi')) && following === '0') {
          following = num;
        }
      }
    });
  }
  
  return {
    username,
    posts,
    followers,
    following
  };
}

function fillBirthdayFields() {
  window.close();
  const monthSelect = document.querySelector('select[title="Month:"]');
  const daySelect = document.querySelector('select[title="Day:"]');
  const yearSelect = document.querySelector('select[title="Year:"]');
  

  if (!monthSelect || !daySelect || !yearSelect) {
    throw new Error('Không tìm thấy đủ trường ngày sinh');
  }
  
  console.log('✓ Đã tìm thấy đủ 3 trường');
  
  const randomMonth = Math.floor(Math.random() * 12) + 1;
  const randomDay = Math.floor(Math.random() * 28) + 1;
 const randomYear = Math.floor(Math.random() * (1990 - 1960 + 1)) + 1960;

  
  console.log('Random date: ' + randomDay + '/' + randomMonth + '/' + randomYear);
  

  const setSelectValue = (select, value, fieldName) => {
    return new Promise((resolve) => {
      select.focus();
      select.value = value.toString();
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('blur', { bubbles: true }));
      console.log('✓ Đã set ' + fieldName + ' = ' + value);
      setTimeout(resolve, 300);
    });
  };
  

  setSelectValue(monthSelect, randomMonth, 'Month')
    .then(() => setSelectValue(daySelect, randomDay, 'Day'))
    .then(() => setSelectValue(yearSelect, randomYear, 'Year'))
    .then(() => {
      console.log('✓ Hoàn thành điền tất cả fields');
      
      return new Promise((resolve) => {
        setTimeout(() => {
          const allButtons = document.querySelectorAll('[role="button"]');
          
          for (const btn of allButtons) {
            if (btn.textContent.trim() === 'Next') {
              console.log('✓ Bấm nút Next');
              btn.click();
              break;
            }
          }
          resolve();
        }, 1000);
      });
    })
    .then(() => {
    
      return new Promise((resolve) => {
        setTimeout(() => {
          const yesButton = document.querySelector('button._a9--._ap36._asz1');
          
          if (yesButton && yesButton.textContent.trim() === 'Yes') {
            console.log('✓ Bấm nút Yes');
            yesButton.click();
          } else {
            console.warn('⚠ Không tìm thấy nút Yes (có thể chưa hiện)');
          }
          resolve();
        }, 1500);
      });
    })
    .then(() => {
      console.log('✓ Hoàn thành toàn bộ flow!');
    });
}
