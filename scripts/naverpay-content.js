// 받기 버튼 자동 클릭
function clickPointButton() {
    const pointLinks = document.querySelectorAll("a.popup_link");

    for (const link of pointLinks) {
        const text = link.textContent.trim();
        if (text.includes("포인트 받기")) {
            link.click();
            return true;
        }
    }

    const pointSpans = document.querySelectorAll("span.text");

    for (const span of pointSpans) {
        const text = span.textContent.trim();
        if (text.includes("포인트 받기")) {
            const parent = span.closest("a");
            if (parent) {
                parent.click();
                return true;
            }
        }
    }

    return false;
}

// 즉시
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", clickPointButton);
} else {
    clickPointButton();
}

// 페이지 로딩 후
let attempts = 0;
const maxAttempts = 5;
const intervalId = setInterval(() => {
    attempts++;
    if (clickPointButton() || attempts >= maxAttempts) {
        clearInterval(intervalId);
    }
}, 1000);
