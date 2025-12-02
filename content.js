// Lắng nghe message từ popup
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
  // Cách 1: Lấy username từ URL
  let username = '';
  const urlMatch = window.location.pathname.match(/^\/([^\/]+)/);
  if (urlMatch) {
    username = urlMatch[1];
  }
  
  // Cách 2: Nếu không có từ URL, tìm trong header
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
  
  // Tìm tất cả elements trong header chứa số và từ khóa
  const headerText = document.querySelector('header')?.innerText || '';
  
  // Tìm theo pattern: "số + từ khóa"
  const postMatch = headerText.match(/(\d+[\d,\.KMB]*)\s*post/i);
  const followerMatch = headerText.match(/(\d+[\d,\.KMB]*)\s*follower/i);
  const followingMatch = headerText.match(/(\d+[\d,\.KMB]*)\s*following/i);
  
  if (postMatch) posts = postMatch[1].replace(/,/g, '');
  if (followerMatch) followers = followerMatch[1].replace(/,/g, '');
  if (followingMatch) following = followingMatch[1].replace(/,/g, '');
  
  // Nếu không tìm thấy bằng regex, thử tìm trong các li elements
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
  // Tìm các select cho Month, Day, Year
  const selects = document.querySelectorAll('select[title]');
  
  if (selects.length < 3) {
    throw new Error('Không tìm thấy các trường ngày sinh. Vui lòng mở trang đăng ký Instagram.');
  }
  
  // Tạo random date
  const randomMonth = Math.floor(Math.random() * 12) + 1; // 1-12
  const randomDay = Math.floor(Math.random() * 28) + 1;   // 1-28 (để safe với tất cả tháng)
  const randomYear = Math.floor(Math.random() * (1989 - 1950 + 1)) + 1950; // 1950-1989
  
  // Điền vào các select
  let monthSelect = null;
  let daySelect = null;
  let yearSelect = null;
  
  for (const select of selects) {
    const title = select.getAttribute('title').toLowerCase();
    
    if (title.includes('month')) {
      monthSelect = select;
    } else if (title.includes('day')) {
      daySelect = select;
    } else if (title.includes('year')) {
      yearSelect = select;
    }
  }
  
  if (monthSelect && daySelect && yearSelect) {
    // Set values
    monthSelect.value = randomMonth.toString();
    daySelect.value = randomDay.toString();
    yearSelect.value = randomYear.toString();
    
    // Trigger change events để Instagram nhận thấy
    monthSelect.dispatchEvent(new Event('change', { bubbles: true }));
    daySelect.dispatchEvent(new Event('change', { bubbles: true }));
    yearSelect.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Tìm và bấm nút Next
    setTimeout(() => {
      const nextButton = document.querySelector('[role="button"][tabindex="0"]');
      if (nextButton) {
        const buttonText = nextButton.textContent.trim().toLowerCase();
        if (buttonText === 'next') {
          nextButton.click();
        } else {
          // Tìm button có text "Next"
          const allButtons = document.querySelectorAll('[role="button"]');
          for (const btn of allButtons) {
            if (btn.textContent.trim() === 'Next') {
              btn.click();
              break;
            }
          }
        }
      }
    }, 500);
  } else {
    throw new Error('Không tìm thấy đủ trường ngày sinh (Month, Day, Year)');
  }
}