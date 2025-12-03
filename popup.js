document.getElementById("extractBtn").addEventListener("click", async () => {
  const btn = document.getElementById("extractBtn");
  const status = document.getElementById("status");

  btn.disabled = true;
  status.textContent = "⏳ Đang lấy thông tin...";
  status.className = "info show";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab.url.includes("instagram.com")) {
      throw new Error("Vui lòng mở trang Instagram profile");
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "extractInfo",
    });

    if (!response.success) {
      throw new Error(response.error || "Không thể lấy thông tin");
    }

    let cookies = [];
    try {
      cookies = await chrome.cookies.getAll({ domain: ".instagram.com" });

      if (cookies.length === 0) {
        cookies = await chrome.cookies.getAll({ domain: "instagram.com" });
      }

      if (cookies.length === 0) {
        cookies = await chrome.cookies.getAll({ url: tab.url });
      }
    } catch (e) {
      console.error("Lỗi lấy cookies:", e);
    }

    const cookieJson = JSON.stringify(cookies);

    const output = `${response.data.username}|${response.data.posts} posts|${response.data.followers} followers|${response.data.following} follwing|${cookieJson}`;

    await navigator.clipboard.writeText(output);

    status.textContent = "✅ Đã copy vào clipboard!";
    status.className = "success show";

    setTimeout(() => {
      status.className = status.className.replace("show", "");
    }, 3000);

        setTimeout(() => {
          window.close();
        }, 200);
  } catch (error) {
    status.textContent = "❌ Lỗi: " + error.message;
    status.className = "error show";
  } finally {
    btn.disabled = false;
  }
});

function generatePassword() {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const special = "#";

  let pw = "";

  pw += special;
  pw += lower[Math.floor(Math.random() * lower.length)];
  pw += upper[Math.floor(Math.random() * upper.length)];
  pw += nums[Math.floor(Math.random() * nums.length)];

  const all = lower + upper + nums;
  for (let i = 0; i < 14; i++) {
    pw += all[Math.floor(Math.random() * all.length)];
  }

  pw = pw
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  document.getElementById("passwordOutput").textContent = pw;
  localStorage.setItem("lastPassword", pw);
  return pw;
}

async function copyPassword() {
  const pw = document.getElementById("passwordOutput").textContent;
  if (!pw || pw.includes("Click")) return;

  try {
    await navigator.clipboard.writeText(pw);
    showNotification("Đã copy password!");
  } catch (err) {
    console.error("Clipboard write failed", err);
    showNotification("Không thể copy — trình duyệt chặn clipboard");
  }
}

async function copyPasswordWithTime() {
  const pw = document.getElementById("passwordOutput").textContent;
  if (!pw || pw.includes("Click")) return;

  const now = new Date().toLocaleString("vi-VN");
  const text = `${pw}|${now}`;

  try {
    await navigator.clipboard.writeText(text);
    showNotification("Đã copy password + thời gian!");
  } catch (err) {
    console.error("Clipboard write failed", err);
    showNotification("Không thể copy — trình duyệt chặn clipboard");
  }
}

let notifyTimeout;
function showNotification(msg) {
  let n = document.getElementById("notification");
  if (!n) {
    n = document.createElement("div");
    n.id = "notification";
    n.className = "notification";
    n.style.display = "none";
    document.body.appendChild(n);
  }

  n.textContent = msg;
  n.style.display = "block";

  clearTimeout(notifyTimeout);
  notifyTimeout = setTimeout(() => {
    n.style.display = "none";
  }, 2500);
}

function loadSavedPassword() {
  const saved = localStorage.getItem("lastPassword");
  if (saved) {
    document.getElementById("passwordOutput").textContent = saved;
  }
}

function clearPassword() {
  localStorage.removeItem("lastPassword");
  document.getElementById("passwordOutput").textContent =
    'Click "Reset Pass" để tạo mật khẩu';
  showNotification("Đã xóa password đã lưu!");
}

document.addEventListener("DOMContentLoaded", () => {
  loadSavedPassword();
  document
    .getElementById("resetPassBtn")
    .addEventListener("click", generatePassword);
  document
    .getElementById("copyPassBtn")
    .addEventListener("click", copyPassword);
  document
    .getElementById("copyPassTimeBtn")
    .addEventListener("click", copyPasswordWithTime);
  const clearBtn = document.getElementById("clearPassBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearPassword);
  }

  document
    .getElementById("fillBirthdayBtn")
    .addEventListener("click", async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        showNotification("⏳ Đang điền ngày sinh...");

        chrome.tabs.sendMessage(
          tab.id,
          { action: "fillBirthday" },
          (response) => {
            if (response && response.success) {
              console.log("✓ Script đã chạy thành công");
            } else if (response && response.error) {
              console.error("❌ Lỗi:", response.error);
            }
          }
        );

        setTimeout(() => {
          window.close();
        }, 200);
      } catch (error) {
        console.error("Error:", error);
        showNotification("❌ Lỗi: " + error.message);
      }
    });
});
