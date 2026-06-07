// ==UserScript==
// @name         DC 15 트윅
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  트윅
// @match        *://*.dcinside.com/*
// @grant        none
// @license MIT
// @downloadURL  https://raw.githubusercontent.com/dmk1005/dcjs/refs/heads/main/dc15%ED%8A%B8%EC%9C%85.user.js
// @updateURL    https://raw.githubusercontent.com/dmk1005/dcjs/refs/heads/main/dc15%ED%8A%B8%EC%9C%85.user.js
// ==/UserScript==

(function() {
    function setFavicon() {
        var head = document.getElementsByTagName('head')[0] || document.documentElement;

        var existingFavicons = head.querySelectorAll("link[rel*='icon']");
        existingFavicons.forEach(function(el) {
            el.parentNode.removeChild(el);
        });

        var create_fav_link = document.createElement('link');
        create_fav_link.setAttribute('rel', 'shortcut icon');
        create_fav_link.setAttribute('type', 'image/png');
        create_fav_link.setAttribute('href', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsSAAALEgHS3X78AAABqElEQVQ4jZWTv2pUURDGfzPn3Gtc3BgEW2FZhDWVkMbGZxB7n8AXyDP4ApZW6SzEwsoyjU1EEUM0LIKYSpAoS5K795wZi7Mbd282qB8MMzBnvvl7BODl7rEzg1sxnaIFKVqFLh7c3xBZDDYz3BxzPycSFVSkaNULJNHNcRzLRkoZy0Y2w8wAUFWCKhoUVUVVkBmhIMRsVoLbxHTaktrEvbs32BxeB2B//JM3734QYiBWkRgjqqAhoKrEnBJtm2nOGs5OG6bTxOZwgEjp2d15vfuNuo7UVyqquiKEQF2DALLz6si37vQZDfpLvS0SrMLh1xPeH56gzWnDaNAvfS1Il6wrt2/1yNmIbZuXHs8zdkm61Xz6MilbyB2Cv+HJ0z3Wemusr/e52qu5uNh/gFjEPWNZiP8bvP14C4CD8YS9/QmqUi2zrxhi1ycijIbXMINYVRUfP/+6dF1vP3xf6TsYlyHKs+dHnlMipXKJUKbt7uVQVIstQgiBEJQYIyFGQghEJSBBEZSgkXmyedAizj+VKIoiLkhK2XdezMr0P9/4MggCUubx6OFNfgPmn7765GE2UgAAAABJRU5ErkJggg==");

        head.appendChild(create_fav_link);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setFavicon();
    } else {
        document.addEventListener('DOMContentLoaded', setFavicon);
    }
})();

(function () {
    const h2 = document.querySelector('.page_head h2');
    if (!h2) return;

    const a = h2.querySelector('a');
    if (!a) return;

    if (a.querySelector('span._inserted_gall')) return;

    const textNodes = Array.from(a.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
    for (const node of textNodes) {
        if (node.nodeValue.includes("갤러리")) {
            node.nodeValue = node.nodeValue.replace("갤러리", "").trim() + " ";
            break;
        }
    }
    const gallSpan = document.createElement("span");
    gallSpan.textContent = "갤러리";
    gallSpan.className = "_inserted_gall";
    gallSpan.style.color = "rgb(91, 121, 201)";

    const icon = a.querySelector('.pagehead_titicon');
    if (icon) {
        a.insertBefore(gallSpan, icon);
    } else {
        a.appendChild(gallSpan);
    }

    const el = document.querySelector('.page_head h2 a');
    if (el) el.style.color = '#5d5d5d';



    const ths = document.querySelectorAll('th[scope="col"]');

    ths.forEach(th => {
        let imgUrl = '';
        const text = th.textContent.trim();

        if (text === '번호') {
            imgUrl = 'https://nstatic.dcinside.com/dgn/gallery/images/title_no.gif';
        } else if (text === '제목') {
            imgUrl = 'https://nstatic.dcinside.com/dgn/gallery/images/title_subject.gif';
        } else if (text === '글쓴이') {
            imgUrl = 'https://nstatic.dcinside.com/dgn/gallery/images/title_writer.gif';
        } else if (text === '작성일') {
            imgUrl = 'https://nstatic.dcinside.com/dgn/gallery/images/title_date.gif';
        } else if (text === '조회') {
            imgUrl = 'https://nstatic.dcinside.com/dgn/gallery/images/title_hit.gif';
        } else if (text === '추천') {
            imgUrl = 'https://nstatic.dcinside.com/dgn/gallery/images/title_recommend.gif';
        }

        if (imgUrl) {
            th.style.backgroundImage = `url('${imgUrl}')`;
            th.style.backgroundRepeat = 'no-repeat';
            th.style.backgroundPosition = 'center';
            th.style.fontSize = '0';
        }
    });
})();

(function () {
    const url = location.href;
    const targets = [
        "https://gall.dcinside.com/board/",
        "https://gall.dcinside.com/mgallery/board/",
        "https://gall.dcinside.com/mini/board/",
        "https://gall.dcinside.com/person/board/",
    ];

    if (!targets.some(prefix => url.startsWith(prefix))) return;

    function fixRightContentHeight() {
        const el = document.querySelector(".right_content");
        if (!el) return;

        const currentHeight = el.offsetHeight;
        if (currentHeight < 1000) {
            el.style.setProperty("height", "1000px", "important");
            el.style.setProperty("position", "relative", "important");
        }
    }

    window.addEventListener("load", fixRightContentHeight);
    window.addEventListener("resize", fixRightContentHeight);
    window.addEventListener("scroll", fixRightContentHeight);

    new MutationObserver(fixRightContentHeight).observe(document.body, {
        childList: true,
        subtree: true,
    });
})();



  function updateBg() {
    const boxes = document.querySelectorAll('.tabbox_btn.bluegray, .tabbox_btn.red');
    if (!boxes.length) return;

    const isHotPage = location.href.includes('/hot/');

    boxes.forEach(box => {
      const onBtn = box.querySelector('.btn_tab.on');
      box.style.backgroundPosition = '0 0';

      if (onBtn) {
        const text = (onBtn.querySelector('span')?.textContent || onBtn.textContent).trim();
        const isBluegray = box.classList.contains('bluegray');

        if (isBluegray && isHotPage) {
          if (text.includes('인기순')) {
            box.style.backgroundPosition = '0 -40px';
          } else if (text.includes('최신순')) {
            box.style.backgroundPosition = '0 0';
          }
        } else {
          if (text.includes('신상') || text.includes('주간')) {
            box.style.backgroundPosition = '0 -40px';
          } else if (text.includes('인기') || text.includes('일간') || text.includes('인기순')) {
            box.style.backgroundPosition = '0 0';
          }
        }
      }
    });
  }

  setTimeout(updateBg, 0);

  document.querySelectorAll('.tabbox_btn.bluegray .btn_tab, .tabbox_btn.red .btn_tab').forEach(btn => {
    btn.removeEventListener('click', updateBg);
    btn.addEventListener('click', () => setTimeout(updateBg, 0));
  });

  const boxes = document.querySelectorAll('.tabbox_btn.bluegray, .tabbox_btn.red');
  boxes.forEach(box => {
    new MutationObserver(() => setTimeout(updateBg, 0)).observe(box, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  });




updateBg();

(function () {
    'use strict';

    const visitBox = document.getElementById('visit_history');
    if (!visitBox) return;

    if (location.href.includes('/board/lists')) {
        const rightContent = document.querySelector('.listwrap .issuebox');
        if (rightContent) rightContent.appendChild(visitBox);

    }

    if (location.href.includes('/board/view') ||
        location.href.includes('/board/write') ||
        location.href.includes('/board/modify') ||
        location.href.includes('/board/delete')) {

        const leftContent = document.querySelector('.issue_wrap');
        if (leftContent) leftContent.appendChild(visitBox);

    }

    if (location.href.includes('/board/lists?id=dcbest')) {
        const leftContent = document.querySelector('.issue_wrap');
        if (leftContent) leftContent.appendChild(visitBox);

    }

    const hotcateList = document.querySelector('.hotcate_list.clear');
    if (hotcateList) {
        hotcateList.parentNode.insertBefore(visitBox, hotcateList);
    }

    const mgallList = document.querySelector('.mgall_list_wrap.clear, .mini_list_wrap.clear');
    if (mgallList) {
        mgallList.parentNode.insertBefore(visitBox, mgallList.nextSibling);
    }

})();



[
    'total_content_count',
    'total_reple_count',
    'total_gallery_count'
].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = el.textContent.replace('개', '');
    }
});




(function () {
    'use strict';

    if (!location.href.match(/^https?:\/\/gall\.dcinside\.com\/board\/lists\/\?id=cartoon\b/)) return;

    const writeBtn = document.getElementById("btn_write");
    if (!writeBtn) return;

    writeBtn.style.marginTop = "-23px";
    writeBtn.style.marginLeft = "8px";

    const link = document.createElement("a");
    link.href = "https://toon.dcinside.com/";
    link.target = "_blank";

    const img = document.createElement("img");
    img.src = "https://nstatic.dcinside.com/dgn/gallery/images/dctoon_btn.png";
    img.alt = "만화 만들기";

    link.appendChild(img);

    writeBtn.parentNode.insertBefore(link, writeBtn);
})();





(function() {
    'use strict';

    const newElementHTML = '<li id="li_DNA" ><a href="http://dc.news-ade.com/">DNA</a></li><li id="li_dcnews" ><a href="http://www.dcnews.in/">디시뉴스</a></li><li id="li_news" ><a href="https://dcnewsj.joins.com/">뉴스</a></li><li id="li_event"><a href="https://event.dcinside.com/">이벤트</a></li><li id="li_game" ><a href="#" >게임센터</a></li><li id="li_anime"><a href="https://mall.dcinside.com/?from=A14">애니센터</a></li><li id="li_mandu" ><a href="https://mall.dcinside.com/?from=A08">만두몰</a></li><li id="li_werner" ><a href="#">워너타</a></li><li id="li_dcwiki" ><a href="https://wiki.dcinside.com/wiki/%EB%8C%80%EB%AC%B8">디시위키</a></li><li id="li_mandu2" ><a href="https://mall.dcinside.com/?from=A08">만두몰</a></li>'; // 원하는 HTML로 변경

    const gnbList = document.querySelector('nav.gnb.clear  ul.gnb_list.clear');

    if (gnbList) {
        gnbList.insertAdjacentHTML('beforeend', newElementHTML);
    }
})();
















(function() {
    'use strict';

    const recommendBox = document.querySelector('.btn_recommend_box.morebox');
    if (!recommendBox) return;

    const style = document.createElement('style');
    style.innerHTML = `
        .btn-hit-recommend, .btn-report-obscene, .btn-report-post {
            background: url("https://nstatic.dcinside.com/dgn/gallery/images/new_report_bts_t.gif") no-repeat;
            width: 85px; height: 24px; font-size: 0; margin-left: 5px; float: left; position: relative;
        }
        .btn-report-obscene { background-position: 0 -114px; }
        .btn-report-post { background-position: 0 -76px; }
        #old_hit_btn, #old_report_19, #old_report_gall, .btn-info { display: block; height: 100%; cursor: pointer; }
        #old_hit_btn { width: 63px; float: left; }
        .btn-info { width: 22px; float: right; cursor: help; }
        #old_ui_wrapper { margin: 18px 0 0 365px; }
        .post-footer-buttons { float: right; }
        #old_tw, #old_fb, #old_ks, #old_scrap, #old_copy_url { float: left; cursor: pointer; }
        #singo_lyr, .btn_recommend_box.morebox .inner_box::after, .btn_recommend_box.morebox .btn_snsmore,
        .btn_recommend_box.morebox .btn_report, .btn_recommend_box.morebox .btn_nhitgall,
        .btn_recommend_box.morebox .btn_silbechu, .btn_recommend_box.morebox .btn_snscrap { display: none !important; }
        .tooltip-box {
            position: absolute; z-index: 150; width: 260px; height: 82.2px; bottom: 30px;
            background-image: url('data:image/gif;base64,R0lGODlhBQEPANUAAOfn5/j4+N3d3fT09NfX17q6utbW1unp6bW1tcfHx/7+/ujo6LOzs9LS0ri4uMLCwtPT07m5ueLi4vDw8P39/eTk5M/Pz/Ly8r+/v+zs7Obm5re3t9TU1Pv7+/r6+tzc3OXl5bKysv///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAFAQ8AAAbKwJBoSCwaj8ikcslsOp/QqHRKrVqvxhBIiO16v+CweEx+arnltHrNbruZ57d8Tq/blfG7fs/vX/N+gYKDfloFAISJiotqABsgBw4hk5SVlpeYmZqbnJ2en6ChmQ1JDaKnqKmqmA4GCyIBACCztLW2t7i5uru8vb6/wMG4CRBHHAnCycrLzLkAAYzRYgoPBkUEGBUT0tzd3kYeBQJDAhESGQrf6uuLFwgaAAgCBxTs9vd+CwwMBAAd+AAD1vlgAQQ0gQgTrhkwQGGZIAA7');
            background-color: transparent; display: none; background-repeat: no-repeat; background-position: bottom;
        }
        .tooltip-box2 { line-height: 1.3; color: rgb(72, 72, 72); font-family: 돋움, Dotum; font-size: 11px; padding: 10px 5px 5px 10px;
            background-image: url('data:image/gif;base64,R0lGODlhBQHJAbMJALKysuXl5ezs7MLCwri4uLm5uefn5/n5+f///////wAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAAkALAAAAAAFAckBAAT/UAxAq7046827/2AojmRpnmg1CEkRIHAsz3Rt33iu73zv/8CgcEiMBQgHQHHJbDqf0Ki0BzAop9isdsvt6gCBq3dMLpvPNbAYzW6730I1fE6v0+X2vH6vxfP/gIFAfoKFhocIhIiLjHWKjZCRZo+SlZZYlJeam0WZnJ+gO56hpKUxo6apn6iqrZasrrGNsLK1hrS2uX+4ur12vL7Bb8DCxWfExsleyMrNWczO0VDQ0tVL1NbZQdja3Tzc3uE34OLlMuTm5ujp4uvs3u7v2vHy1vT10vf4zvr7yv3+jAEMKGwgQV8GD+pKqNAWw4ayHkJ0JXGiqooWTWHMSGojR1Ae/z9yCilSE8mSr8KglHdyZaSWLmepjKluJs12Nm/Cy6lzHs+e9n4CzSd0KL+iRv8hTSpwKdOCTp8ijCp1IdWqDq9ijah1K8WuXi+CDatxLNmOZs+CTKt2JNu2Jt/CTblmbi2Ydo/JzQsJL18yfv8u2ysYUeDCWw4jfkZ4sSDFjqVAjjytMWU+ky83yaz5muXOvz6DviN6NBzOpreVTt0GNWsfrl9/Wy17Eu3agG/jHlx3t2HdvhMDD864N/HHw49LTq68svHmmJlD3yx9uufn1kNjz056O/fT1b+r9i6+dfjysM+jn01+ve327nPDj8+bfnf7c2Jb1z+dP3T/zQGonP+AxxFInIHBIeibgrsxiJuDtUEom4SvUciahalhaJqGo3EImoedgaiZiJeRSJmJkaHomIqLsYiYi4XBKJiMf9HIl4154WiXjnPxCJePbQGplpBnEUmWkWEh6ZWSWzGJlZNVQSmVlE9RyZSVSWFplJZDcQmUlz2BqZOYN5FJk5kxoemSmiuxiZKbJcEpkpwf0cmRnRnhaZGeE/EJkZ8NAaqQoAcRSpChASHqj6L7MIqPo/VAypJ6+KVBaaUzSPqOpuxwmo6nNc2HKSaXjgoDqOWgipOopkahajiv7sRqq0/E2o2tPs1KK3W67nqdr2Xgmo2wQfUK7BDEVpMsUcYeO57/s/VBy8Wy0VB7VLPSUlGqqdY2061S2GYryrajfpuMuU2FK24O6BbTLlTqrjsOuZi+G4y9U8Urr6X67pspvZXi24vAVvXr7ykA40dwLgtnZfDBiSRsX8N3SUwfxVw9fDDGsXD8lcb+etyKyGKBvC/JqaBclsnyqlyKy2ixvC7ModC8lszi2ryKxfHp7BbO2fq8idBxAS0t0ZcgTRfEzjFdK8/uKV2J1JJQ/RLU61ndF9boaS2T0dB6zYjYi5D9G9jOmn2I2rdwXR7bhcCNHNrHyh2I3YDgvYvb4ukdHd3A+r2H4HoQnofh2jntBOKO8P0d4/cpzgTk+TnOHeXgAe4r/+bDWJ4d526Abp7mu4rOhulooK4X6bSq/p7kk3u+n+z90f6f7QHiPqDuBfJ+oO8JAr+g8A0S/6DxESI/ofIVMn+h8xlCv6H0HVL/ofUhYj+i9iVyf6L3KYK/ovgtkv+i+TGiP6P6NbJ/o/s5wr+j/D3S/6P9QeI/pP5F8n+k/0kC4JIE2CQCPsmAUULglBRYJQZeyYFZguCWJNglCn7JgmHC4Jg0WCYOnsmDaQLhmkTYJhK+yYRxQuGcVFgnFt7JhXmC4Z5k2Cca/smGgcLhoHRYKB4eyoeJAuKihNgoIj7KiJFC4qRY1yrXBUuJm4Jip6T4KSqGCna/wiIRnCgfLWVu0YqpAuOqvIgsMcLKjLIiYxzQeCs25kqNz4LjD7g4BjpGS47aYiK33DgsPhYLj+nRY7n8qCxCMguQeUQkexQ5LkHWy5DVguS1GPkFSXrLkuCiJLsweS5OpkuTOLBjF0Q5rQBEAAA7');
        }
        .btn-info:hover + .tooltip-box { display: block; }

        .recom_bottom_box {width: 290px; height: 0 !important;}
        #scrapdone_recom , #scrapdone_non_recom {left: 0 !important; margin-left: -459px !important;}

        #user_dcbest_lyr { right: 100%;}
    `;
    document.head.appendChild(style);

    recommendBox.innerHTML += `
    <div id="old_ui_wrapper">
        <a id="old_tw"><img alt="트위터" src="https://nstatic.dcinside.com/dgn/gallery/images/btn_s_t.gif"></a>
        <a id="old_fb"><img alt="페이스북" src="https://nstatic.dcinside.com/dgn/gallery/images/btn_s_f.gif"></a>
        <a id="old_ks"><img alt="카카오스토리" src="https://nstatic.dcinside.com/dgn/gallery/images/btn_s_k.gif"></a>
        <a id="old_scrap"><img alt="스크랩" src="https://nstatic.dcinside.com/dgn/gallery/images/btn_s_scrap_new.gif"></a>
        <a id="old_copy_url"><img alt="주소복사" src="https://nstatic.dcinside.com/dgn/gallery/images/btn_s_urlcopy.gif"></a>
    </div>
    <div class="post-footer-buttons">
        <ul>
            <li id="li_old_hit" class="btn-hit-recommend">
                <div class="btn-wrapper">
                    <a href="javascript:;" id="old_hit_btn">힛갤 추천</a>
                    <a class="btn-info">?</a>
                    <div class="tooltip-box"><div class="tooltip-box2">
                    힛갤 추천 버튼을 클릭하시면 유저추천힛 갤러리로 이용자가 추천한 게시물이 등록됩니다.
                    <br>추천된 게시물들 중에 관리자가 선별하여 힛갤로
                    <br>노출하게 됩니다.
                    </div></div>
                </div>
            </li>
            <li class="btn-report-obscene"><a id="old_report_19">음란물 신고</a></li>
            <li class="btn-report-post"><a id="old_report_gall">게시물 신고</a></li>
        </ul>
    </div>`;

    const triggerClick = (selector) => {
        const target = document.querySelector(selector);
        if (target) target.dispatchEvent(new MouseEvent('click', { view: window, bubbles: true, cancelable: true }));
    };

    const getCleanSnsUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const no = params.get('no');
        const pathParts = window.location.pathname.split('/');
        const type = (pathParts[1] === 'board') ? '' : pathParts[1] + '/';
        return `https://gall.dcinside.com/${type}board/view/?id=${id}&no=${no}`;
    };

    const snsUrl = getCleanSnsUrl();
    const postTitle = document.title.split(' - ')[0];

    if (!document.querySelector('.btn_silbechu')) {
        const hitBtn = document.getElementById('li_old_hit');
        if (hitBtn) hitBtn.style.display = 'none';
    }

    document.getElementById('old_hit_btn').onclick = (e) => {
        e.preventDefault();
        if (document.querySelector('.btn_silbechu')) triggerClick('.btn_silbechu');
        else triggerClick('.btn_recom_up');
    };

    document.getElementById('old_tw').onclick = () => {
        const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(snsUrl)}`;
        window.open(twUrl, '_blank', 'width=600,height=400');
    };

    document.getElementById('old_fb').onclick = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(snsUrl)}`, '_blank', 'width=600,height=500');
    };

    document.getElementById('old_ks').onclick = () => {
        window.open(`https://story.kakao.com/share?url=${encodeURIComponent(snsUrl)}`, '_blank', 'width=600,height=500');
    };

    document.getElementById('old_scrap').onclick = (e) => {
        e.preventDefault();
        if (typeof window.recom_scrap === "function") window.recom_scrap();
        else triggerClick('.btn_snscrap');
    };
    document.getElementById('old_copy_url').onclick = () => {
        navigator.clipboard.writeText(snsUrl).then(() => alert("주소가 복사되었습니다."));
    };

    document.getElementById('old_report_19').onclick = (e) => { e.preventDefault(); triggerClick('.btn_report'); setTimeout(() => triggerClick('.report19'), 150); };
    document.getElementById('old_report_gall').onclick = (e) => { e.preventDefault(); triggerClick('.btn_report'); setTimeout(() => triggerClick('.report_gall_go'), 150); };

})();












(function() {
    'use strict';

    if (window.location.hostname === 'www.dcinside.com' &&
       (window.location.pathname === '/' || window.location.pathname === '/index.php')) {

        function getTargetDateStr() {
            const now = new Date();
            let target = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());

            const minDate = new Date('2015-09-01T00:00:00');
            const maxDate = new Date('2018-09-30T23:59:59');

            if (target < minDate) {
                target = minDate;
            } else if (target > maxDate) {
                target = maxDate;
            }

            const yy = String(target.getFullYear()).slice(-2);
            const mm = String(target.getMonth() + 1).padStart(2, '0');
            const dd = String(target.getDate()).padStart(2, '0');

            return yy + mm + dd;
        }

        const dateStr = getTargetDateStr();
        const newImageUrl = `https://wstatic.dcinside.com/main/main2011/dcmain/logo_swf/top_logo_${dateStr}.png`;

        const css = `
            .dc_logo a {
                background-image: url("${newImageUrl}") !important;
                width: 325px !important;
                height: 110px !important;
                display: block !important;
            }
            .typea .dc_logo {
                top: -10px !important;
                left: -50px !important;
                position: relative !important;
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.innerText = css;
        (document.head || document.documentElement).appendChild(styleSheet);

        console.log("디시 메인 로고 변경 완료: " + dateStr);
    }

})();


