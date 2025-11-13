let cachedLinks = [];

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

        cachedLinks = results[0]?.result || [];

        if (cachedLinks.length === 0) {
            showNoLinksMessage();
        } else {
            const title = document.querySelector("h1");
            title.textContent = `처리할 링크 ${cachedLinks.length}개`;

            // 시작 버튼에 이벤트 리스너 추가
            const startBtn = document.getElementById("startBtn");
            startBtn.addEventListener("click", openAllLinks);
        }
    } catch (error) {
        console.error("링크 검색 실패:", error);
        showNoLinksMessage();
    }
});

function findNaverPayLinks() {
    const links = [];
    const linkElements = document.querySelectorAll('a[href*="campaign2.naver.com"], a[href*="ofw.adison.co"]');

    linkElements.forEach((element) => {
        const url = element.href;
        const title = element.textContent.trim() || element.title || "네이버페이 링크";

        if (url && (url.includes("campaign2.naver.com") || url.includes("ofw.adison.co"))) {
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

// 모든 링크 열기 함수
async function openAllLinks() {
    if (cachedLinks.length === 0) {
        alert('열릴 링크가 없습니다.');
        return;
    }

    const startBtn = document.getElementById("startBtn");
    const description = document.getElementById("description");

    // 버튼 비활성화 및 텍스트 변경
    startBtn.disabled = true;
    startBtn.textContent = "열리는 중...";
    description.textContent = `${cachedLinks.length}개의 링크를 새 탭에서 열고 있습니다...`;

    try {
        // 모든 링크를 새 탭에서 열기
        const openPromises = cachedLinks.map(link =>
            browser.tabs.create({
                url: link.url,
                active: false // 백그라운드에서 열기
            })
        );

        await Promise.all(openPromises);

        // 완료 메시지
        description.textContent = `${cachedLinks.length}개의 링크를 모두 열었습니다. 포인트 광고 탭을 닫아주세요.`;
        startBtn.textContent = "완료";

    } catch (error) {
        console.error("링크 열기 실패:", error);
        description.textContent = "링크 열기에 실패했습니다. 다시 시도해주세요.";
        startBtn.disabled = false;
        startBtn.textContent = "다시 시도";
    }
}
