document.addEventListener("DOMContentLoaded", async () => {
    try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

        if (!tab.url.includes("clien.net/service/board/jirum")) {
            showNoLinksMessage();
            return;
        }

        const results = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: findNaverPayLinks,
        });

        const links = results[0]?.result || [];

        if (links.length === 0) {
            showNoLinksMessage();
        } else {
            const title = document.querySelector("h1");
            title.textContent = `처리할 링크 ${links.length}개`;
        }
    } catch (error) {
        console.error("링크 검색 실패:", error);
        showNoLinksMessage();
    }
});

function findNaverPayLinks() {
    const links = [];
    const linkElements = document.querySelectorAll('a[href*="campaign2.naver.com"]');

    linkElements.forEach((element) => {
        const url = element.href;
        const title = element.textContent.trim() || element.title || "네이버페이 링크";

        if (url && url.includes("campaign2.naver.com")) {
            links.push({ url, title });
        }
    });

    return links;
}

function showNoLinksMessage() {
    const mainSection = document.querySelector(".main-section");
    mainSection.innerHTML = `
            <div style="padding: 10px; text-align: center; color: #888;">
                <p>링크를 찾을수 없습니다</p>
                <p>클리앙 알뜰구매 게시판의 네이버페이 게시글을 열고 다시 시도하세요</p>
            </div>
        `;
}
