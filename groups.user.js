// ==UserScript==
// @name         Old Roblox Groups Enhancements
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Various enhancements for Roblox groups page: search controls, text changes, report abuse button, member count display, scroll buttons, and right column with controls.
// @author       name
// @match        https://www.roblox.com/communities/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Helper function to wait for an element
    function waitForElement(selector, timeout = 10000, interval = 200) {
        return new Promise(resolve => {
            const end = Date.now() + timeout;
            (function check() {
                const el = document.querySelector(selector);
                if (el) return resolve(el);
                if (Date.now() > end) return resolve(null);
                setTimeout(check, interval);
            })();
        });
    }

    // Section 1: Insert custom search controls
    const searchControlsHTML = `
        <div id="SearchControls" style="margin-bottom: 20px;">
            <form action="https://www.roblox.com/search/communities" method="GET">
                <div class="Searchcontent">
                    <input name="keyword" type="text" id="searchKeyword" maxlength="100" placeholder="Search all groups" class="SearchKeyword" />
                    <input type="submit" id="searchButton" value="Search" class="search-button" />
                </div>
            </form>
        </div>
    `;

    function addSearchButtonEvent() {
        const searchButton = document.getElementById('searchButton');
        const searchInput = document.getElementById('searchKeyword');
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', function(event) {
                const searchValue = searchInput.value.trim();
                if (searchValue === '' || searchValue === 'Search all groups') {
                    event.preventDefault();
                }
            });
        }
    }

    function insertSearchControls() {
        const targets = document.querySelectorAll('.group-profile-header');

        targets.forEach((target) => {
            const parent = target.parentElement;
            if (parent && !parent.querySelector('#SearchControls')) {
                target.insertAdjacentHTML('beforebegin', searchControlsHTML);
                addSearchButtonEvent();
            }
        });
    }

    let searchTimeout;
    const searchObserver = new MutationObserver(() => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(insertSearchControls, 300);
    });

    searchObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    insertSearchControls();

    // Section 2: Change specific texts
function changeTexts() {
    const headings = document.querySelectorAll('.rbx-tab-heading .text-lead.ng-binding');
    headings.forEach(heading => {
        const trimmedText = heading.innerText.trim();
        if (trimmedText === 'Experiences') {
            heading.innerText = 'Game';
        } else if (trimmedText === 'Affiliates') {
            heading.innerText = 'Allies';
        }
    });
}

document.addEventListener('DOMContentLoaded', changeTexts);

const observer = new MutationObserver(() => {
    changeTexts();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

    window.addEventListener('load', () => setTimeout(changeTexts, 1000));

    const textObserver = new MutationObserver((mutations, observer) => {
        changeTexts();
        const headings = document.querySelectorAll('.rbx-tab-heading .text-lead.ng-binding');
        if (headings.length > 0) {
            observer.disconnect();
        }
    });
    textObserver.observe(document.body, { childList: true, subtree: true });

    // Section 3: Add Report Abuse button
    function addReportAbuseButton() {
        const urlParams = new URLSearchParams(window.location.search);
        let groupId = urlParams.get('id');

        if (!groupId) {
            const pathParts = window.location.pathname.split('/');
            groupId = pathParts[2];
        }

        if (!groupId) {
            console.error("Group ID is missing or invalid.");
            return;
        }

        const reportAbuseHtml = `
            <div id="AbuseReportPanel" class="ReportAbuse">
                <span class="AbuseIcon">
                    <a id="ReportAbuseIconHyperLink" href="https://www.roblox.com/abusereport/group?id=${groupId}">
                    </a>
                </span>
                <span class="AbuseButton">
                    <a id="ctl00_cphRoblox_AbuseReportButton_ReportAbuseTextHyperLink" href="https://www.roblox.com/abusereport/group?id=${groupId}">Report Abuse</a>
                </span>
            </div>
        `;

        const targetElement = document.querySelector('.description-content.text-body-medium.content-default');
        if (targetElement && !document.getElementById('AbuseReportPanel')) {
            targetElement.insertAdjacentHTML('afterend', reportAbuseHtml);
        }
    }

    let abuseAttempts = 0;
    const abuseInterval = setInterval(() => {
        addReportAbuseButton();
        abuseAttempts++;
        if (document.getElementById('AbuseReportPanel') || abuseAttempts > 20) {
            clearInterval(abuseInterval);
        }
    }, 500);

    // Section 4: Parse and display member count
    const toSelector = cls => '.' + cls.trim().split(/\s+/).join('.');
    const parseToInteger = text => {
        if (!text) return null;
        const s = text.replace(/\+/g, '').trim();

        const unitMatch = s.match(/([\d,.]+)\s*([kKmMbB])\b/);
        if (unitMatch) {
            let num = parseFloat(unitMatch[1].replace(/,/g, ''));
            if (isNaN(num)) return null;
            const unit = unitMatch[2].toUpperCase();
            if (unit === 'K') num *= 1e3;
            if (unit === 'M') num *= 1e6;
            if (unit === 'B') num *= 1e9;
            return Math.round(num);
        }

        const plainMatch = s.match(/([\d,]+)(?![^\s])/);
        if (plainMatch) {
            const n = parseInt(plainMatch[1].replace(/,/g, ''), 10);
            if (!isNaN(n)) return n;
        }

        const digitMatch = s.match(/(\d+)/);
        if (digitMatch) {
            const n = parseInt(digitMatch[1], 10);
            if (!isNaN(n)) return n;
        }

        return null;
    };

    (async function displayMemberCount() {
        const sourceClass = 'flex items-center bg-surface-300 radius-circle text-caption-medium padding-x-medium padding-y-xsmall';
        const targetClass = 'MuiTypography-root MuiTypography-inherit MuiLink-root web-blox-css-tss-quks9y-Link-colorInherit-Link-root MuiLink-underlineHover web-blox-css-mui-94v26k';

        const sourceSelector = toSelector(sourceClass);
        const targetSelector = toSelector(targetClass);

        const source = await waitForElement(sourceSelector);
        if (!source) {
            console.error('Source span not found');
            return;
        }

        const raw = source.textContent.trim();
        const intval = parseToInteger(raw);
        if (intval === null) {
            console.error('Could not parse member count from:', raw);
            return;
        }

        const formattedFull = intval.toLocaleString();

        const memberDiv = document.createElement('div');
        memberDiv.id = 'MemberCount';
        memberDiv.textContent = 'Members: ' + formattedFull;

        const target = document.querySelector(targetSelector);
        if (target) {
            target.insertAdjacentElement('afterend', memberDiv);
        } else {
            document.body.appendChild(memberDiv);
        }
    })();

    // Section 5: Add scroll buttons to groups list
    function addScrollStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .scroll-button-wrapper-up,
            .scroll-button-wrapper-down {
                background: #efefef;
                border: 1px solid #ccc;
                border-top: 0;
                position: relative;
                width: 162px;
                text-align: center;
            }

            .scroll-button-wrapper-up {
                border-bottom: 0;
                top: 65px;
            }

            .scroll-button-wrapper-down {
                top: -1px;
                height: 28px;
            }

            .groups-list-sidebar .group-react-groups-list .groups-list-new .groups-list-items-container {
                overflow: hidden !important;
            }

            .scroll-button-up {
                background-position: left top;
            }

            .scroll-button-down {
                background-position: right top;
            }

            .scroll-button-up.disabled {
                background-position: left bottom;
            }

            .scroll-button-down.disabled {
                background-position: right bottom;
            }

            .scroll-button-up:hover {
                background-position: left -13px;
            }

            .scroll-button-down:hover {
                background-position: right -13px;
            }

            .scroll-button-up,
            .scroll-button-down {
                height: 13px;
                width: 36px;
                margin: 5px 0px;
                display: inline-block;
                text-align: center;
                font-size: 0;
                border: 0;
                background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAAAnCAYAAACsTw7IAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0QjdBQ0U1QTZFQzRFMDExQTI4Q0U0NDI2MTFEMTY3RSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxNEU2NjBFN0M1MjUxMUUwODA5NEU2ODFGNDUxMDgzNyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxNEU2NjBFNkM1MjUxMUUwODA5NEU2ODFGNDUxMDgzNyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1LjEgV2luZG93cyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkE3Q0Y2MTQ3MjRDNUUwMTFBQ0Q1OTA2RDZFOEQ2M0UwIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjRCN0FDRTVBNkVDNEUwMTFBMjhDRTQ0MjYxMUQxNjdFIi8+IDwvcmRmOkRlc2NyaXB0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")
            }
        `;
        document.head.appendChild(style);
    }

    function createScrollButtonWrapper(text, direction, container) {
        const wrapper = document.createElement('div');
        wrapper.className = direction === 'up' ? 'scroll-button-wrapper-up' : 'scroll-button-wrapper-down';

        const button = document.createElement('button');
        button.innerText = text;
        button.className = direction === 'up' ? 'scroll-button-up' : 'scroll-button-down';

        button.addEventListener('click', () => {
            container.scrollBy({
                top: direction === 'up' ? -520 : 520,
                behavior: 'smooth',
            });
        });

        wrapper.appendChild(button);
        return wrapper;
    }

    function addScrollButtons() {
        const groupListContainer = document.querySelector('.groups-list-items-container');
        if (!groupListContainer) return;

        const parent = groupListContainer.parentElement;
        if (parent.querySelector('.scroll-button-wrapper-up') || parent.querySelector('.scroll-button-wrapper-down')) return;

        const upBtn = createScrollButtonWrapper('Up', 'up', groupListContainer);
        const downBtn = createScrollButtonWrapper('Down', 'down', groupListContainer);

        parent.insertBefore(upBtn, groupListContainer);
        parent.appendChild(downBtn); // Insert after groupListContainer
    }

    function toggleDisabledState(container) {
        const upBtn = container.parentElement.querySelector('.scroll-button-up');
        const downBtn = container.parentElement.querySelector('.scroll-button-down');

        if (upBtn) upBtn.classList.toggle('disabled', container.scrollTop === 0);
        if (downBtn) {
            const maxScroll = container.scrollHeight - container.clientHeight;
            downBtn.classList.toggle('disabled', container.scrollTop >= maxScroll);
        }
    }

    function attachScrollObserver(container) {
        toggleDisabledState(container);
        container.addEventListener('scroll', () => toggleDisabledState(container));
    }

    addScrollStyles();

    const scrollObserver = new MutationObserver((mutations, observer) => {
        addScrollButtons();

        const container = document.querySelector('.groups-list-items-container');
        if (container && !container.__hasScrollObserver) {
            attachScrollObserver(container);
            container.__hasScrollObserver = true;
        }

        if (document.querySelector('.scroll-button-wrapper-up')) {
            observer.disconnect();
        }
    });

    scrollObserver.observe(document.body, { childList: true, subtree: true });

    // Section 6: Add right column with funds and controls
    const rightColumnHTML = `
        <div id="right-column">
            <div id="ctl00_cphRoblox_rbxGroupFundsPane_GroupFunds" class="StandardBox" style="padding-right:0">
                <b>Funds:</b>
                <span class="robux" style="margin-left:5px">0</span>
                <span class="tickets" style="margin-left:5px">0</span>
            </div>
            <div class="GroupControlsBox">
                <span class="InsideBoxHeader">Controls</span>
                <div id="AdminOptions"></div>
                <div id="ctl00_cphRoblox_GroupAdminControls">
                    <input type="submit" name="ctl00$cphRoblox$GroupAdminButton" value="Group Admin" onclick="location.href='/My/GroupAdmin.aspx?gid=1';return false;" id="ctl00_cphRoblox_GroupAdminButton" class="btn-control btn-control-medium translate">
                </div>
                <div id="ctl00_cphRoblox_GroupAdvertise">
                    <input type="submit" name="ctl00$cphRoblox$GroupAdvertiseButton" value="Advertise Group" onclick="location.href='/My/NewUserAd.aspx?targetId=1&amp;targettype=Group';return false;" id="ctl00_cphRoblox_GroupAdvertiseButton" class="btn-control btn-control-medium translate">
                </div>
                <div id="ctl00_cphRoblox_ManagePrimaryGroup">
                    <input type="submit" name="ctl00$cphRoblox$MakePrimaryGroupButton" value="Make Primary" onclick="return confirm('Are you sure you want to make this your primary group?');" id="ctl00_cphRoblox_MakePrimaryGroupButton" class="btn-control btn-control-medium translate">
                </div>
                <div id="LeaveGroup">
                    <input type="submit" name="ctl00$cphRoblox$LeaveButton" value="Leave Group" onclick="return confirm('Are you sure you\\'d like to leave this group?');" id="ctl00_cphRoblox_LeaveButton" class="btn-control btn-control-medium translate">
                </div>
                <div id="LeaveClan">
                    <input type="submit" name="ctl00$cphRoblox$LeaveButton" value="Leave Clan" onclick="return confirm('Are you sure you\\'d like to leave this clan?');" id="ctl00_cphRoblox_LeaveButton" class="btn-control btn-control-medium translate">
                </div>
                <div id="ctl00_cphRoblox_GroupAudit">
                    <input type="submit" name="ctl00$cphRoblox$GroupAuditButton" value="Audit Log" onclick="location.href='/Groups/Audit.aspx?groupid=1';return false;" id="ctl00_cphRoblox_GroupAuditButton" class="btn-control btn-control-medium translate">
                </div>
            </div>
        </div>
    `;

    function addCustomStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            #right-column {
                width: 160px;
                float: right;
                position: relative;
                margin-left: 10px;
            }
            span.robux, div.robux {
                background: url("/images/Icons/img-robux.png") 0px 1px no-repeat;
                color: rgb(0, 102, 0);
                font-weight: bold;
                padding: 0px 0px 2px 20px;
                font-size: 12px;
            }
            span.tickets, div.tickets {
                background: url("/images/Tickets.png") 0px 1px no-repeat;
                color: rgb(170, 102, 17);
                padding: 0px 0px 2px 20px;
                font-weight: bold;
                font-size: 12px;
            }
            #left-column .StandardBox, #mid-column .StandardBox, #right-column .StandardBox {
                background: white url("/images/cssspecific/rbx2/standardBox_01_bkg.png") center top repeat-x;
            }
            .StandardBox {
                padding: 5px;
                padding-right: 5px;
                margin-bottom: 8px;
                background: rgb(255, 255, 255) url("/images/cssspecific/rbx2/standardBox_01_bkg.png") center top repeat-x;
                border: 1px solid rgb(170, 170, 170);
                z-index: 0;
            }
            .GroupControlsBox {
                border: 1px solid rgb(204, 204, 204);
                background-color: rgb(239, 239, 239);
                margin-bottom: 10px;
            }
            .InsideBoxHeader {
                margin-left: 14px;
                font-size: 18px;
                font-weight: bold;
                display: block;
                clear: both;
                padding: 3px;
                margin-bottom: 5px;
            }
            .GroupControlsBox div {
                margin: 6px 0px;
                text-align: center;
            }
            .btn-control.btn-control-medium {
                height: 21px;
                line-height: 21px;
                font-size: 12px;
                background-image: url("/images/StyleGuide/btn-control-medium-tile.png");
            }
            .btn-control:hover {
                background-position: center bottom !important;
                border-color: rgb(136, 136, 136);
                text-decoration: none;
            }
            .btn-control, .btn-control:active, .btn-control:link, .btn-control:visited, .btn-control:hover {
                border: 1px solid rgb(119, 119, 119);
                padding: 0px 6px;
                color: rgb(0, 0, 0);
                text-decoration: none;
                background-color: rgb(204, 204, 204);
                text-align: center;
                font-weight: normal;
                cursor: pointer;
                background-position: center top;
                display: inline-block;
            }
            .GroupControlsBox input, .GroupControlsBox button {
                width: 125px;
            }
            .wrap:has(.groups-list-sidebar) .content .group-details-container-desktop-and-tablet {
                max-width: 972px !important;
                min-width: 972px !important;
            }
            [data-internal-page-name="GameDetail"] .content::after, [data-internal-page-name="GroupDetails"] .content::after, [data-internal-page-name="Home"] .no-gutter-ads.logged-in .content::after, [data-internal-page-name="Messages"] .content::after, [data-internal-page-name="CatalogItem"] #content::after, [data-internal-page-name="BundleDetail"] #content::after {
                margin-left: 0 !important;
                left: -160px;
                top: 250px;
            }
        `;
        document.head.appendChild(style);
    }

    function updateRobuxAmount() {
        const robuxAmount = document.getElementById('nav-robux-amount');
        const robuxDisplay = document.querySelector('#right-column .robux');
        if (robuxAmount && robuxDisplay) {
            robuxDisplay.textContent = robuxAmount.textContent;
        }
    }

    function insertRightColumn() {
        const targetElement = document.querySelector('.groups-list-sidebar.ng-scope');
        if (targetElement && !document.getElementById('right-column')) {
            const div = document.createElement('div');
            div.innerHTML = rightColumnHTML;
            targetElement.insertAdjacentElement('afterend', div);
            updateRobuxAmount();
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        addCustomStyles();
        insertRightColumn();
    });

    const rightColumnObserver = new MutationObserver((mutationsList, observer) => {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList' && document.querySelector('.groups-list-new')) {
                addCustomStyles();
                insertRightColumn();
            }
        });
        if (document.getElementById('right-column')) {
            observer.disconnect();
        }
    });

    rightColumnObserver.observe(document.body, { childList: true, subtree: true });
})();
