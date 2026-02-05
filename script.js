// --- Translation Dictionary ---
const translations = {
    ja: {
        diagram_title: "市場形成メカニズム：人間のフロー",
        world_population: "世界人口",
        promotion: "広告宣伝・認知",
        potential_customer: "潜在顧客",
        potential_customer_alt: "潜在顧客",
        advantage: "優位性",
        customer: "顧客",
        market_decline: "市場魅力度の低下",
        non_customer: "非顧客層",
        stock_label: "時価総額",
        billion_yen: "億円",
        term_text: "第15期",
        expiry_label: "有効期限：",
        memo_btn: "メモ",
        calc_btn: "電卓",
        lang_settings: "言語設定 / Language Settings",
        search_placeholder: "言語を検索 / Search language...",
        apply_btn: "適用 / Apply",
        apply_success: "適用完了！"
    },
    en: {
        diagram_title: "Market Formation Mechanism: Human Flow",
        world_population: "World Population",
        promotion: "Advertising & Recognition",
        potential_customer: "Potential Customers",
        potential_customer_alt: "Potential Customers",
        advantage: "Competitive Advantage",
        customer: "Active Customers",
        market_decline: "Decrease in Market Attractiveness",
        non_customer: "Non-customer Segment",
        stock_label: "Market Cap",
        billion_yen: "Billion Yen",
        term_text: "Term 15",
        expiry_label: "Expiry Date:",
        memo_btn: "Memo",
        calc_btn: "Calc",
        lang_settings: "Language Settings",
        search_placeholder: "Search language...",
        apply_btn: "Apply",
        apply_success: "Applied!"
    },
    zh: {
        diagram_title: "市场形成机制：人员流向",
        world_population: "世界人口",
        promotion: "广告宣传与认知",
        potential_customer: "潜在客户",
        potential_customer_alt: "潜在客户",
        advantage: "竞争优势",
        customer: "正式客户",
        market_decline: "市场吸引力下降",
        non_customer: "非客户群",
        stock_label: "市值",
        billion_yen: "亿日元",
        term_text: "第15期",
        expiry_label: "有效期：",
        memo_btn: "备忘録",
        calc_btn: "计算器",
        lang_settings: "语言设置",
        search_placeholder: "搜索语言...",
        apply_btn: "应用",
        apply_success: "应用成功！"
    },
    ko: {
        diagram_title: "시장 형성 메커니즘: 인적 흐름",
        world_population: "세계 인구",
        promotion: "광고 홍보 및 인지도",
        potential_customer: "잠재 고객",
        potential_customer_alt: "잠재 고객",
        advantage: "우위성",
        customer: "고객",
        market_decline: "시장 매력도 저하",
        non_customer: "비고객층",
        stock_label: "시가총액",
        billion_yen: "억 엔",
        term_text: "제15기",
        expiry_label: "유효 기간:",
        memo_btn: "메모",
        calc_btn: "계산기",
        lang_settings: "언어 설정",
        search_placeholder: "언어 검색...",
        apply_btn: "적용",
        apply_success: "적용 완료!"
    }
};

function updateTranslations(langCode) {
    const lang = langCode.startsWith('zh') ? 'zh' : (translations[langCode] ? langCode : 'en');
    const dict = translations[lang] || translations['en'];

    document.querySelectorAll('[data-t]').forEach(el => {
        const key = el.dataset.t;
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    // Update global lang attribute
    document.documentElement.lang = lang;
}

document.addEventListener('DOMContentLoaded', () => {
    // Initial translation load
    const savedLang = localStorage.getItem('biz_ex_selected_language') || 'ja';
    updateTranslations(savedLang);
    let manualScale = 1.0;
    let autoScale = 1.0;

    // --- Fixed Resolution Scaler (Zoom Method) ---
    function adjustZoom() {
        const targetWidth = 1920;
        const targetHeight = 1080;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Calculate scale ratios
        const scaleX = windowWidth / targetWidth;
        const scaleY = windowHeight / targetHeight;

        // Choose the smaller scale to fit the screen (contain)
        autoScale = Math.min(scaleX, scaleY);

        // Final scale is autoScale * manualScale
        const finalScale = autoScale * manualScale;

        // Apply zoom
        document.body.style.zoom = finalScale;

        // Update Zoom Text
        const zoomText = document.getElementById('zoom-val-text');
        if (zoomText) {
            zoomText.textContent = Math.round(finalScale * 100) + '%';
        }
    }

    // --- Zoom Controls ---
    const btnIn = document.getElementById('zoom-in');
    const btnOut = document.getElementById('zoom-out');
    const btnReset = document.getElementById('zoom-reset');

    if (btnIn) {
        btnIn.addEventListener('click', () => {
            manualScale += 0.05;
            if (manualScale > 2.0) manualScale = 2.0;
            adjustZoom();
        });
    }
    if (btnOut) {
        btnOut.addEventListener('click', () => {
            manualScale -= 0.05;
            if (manualScale < 0.2) manualScale = 0.2;
            adjustZoom();
        });
    }
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            manualScale = 1.0;
            adjustZoom();
        });
    }

    window.addEventListener('resize', adjustZoom);
    adjustZoom(); // Initial call

    // --- Audio System initialization ---
    console.log('Biz-Ex Audio System Initializing...');
    const bgm = document.getElementById('home-bgm');
    const bgmBtn = document.getElementById('bgm-toggle');
    const seBtn = document.getElementById('se-toggle');

    let audioCtx;
    let isBgmEnabled = localStorage.getItem('bgm_enabled') !== 'false';
    let isSeEnabled = localStorage.getItem('se_enabled') !== 'false';
    let audioStarted = false;

    function initAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
                console.log('AudioContext Created');
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playClickSound() {
        if (!isSeEnabled) return;
        const ctx = initAudioContext();
        if (!ctx) return;
        try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(2500, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (e) { console.error(e); }
    }

    const handleInteraction = () => {
        initAudioContext();
        if (!audioStarted && bgm && isBgmEnabled) {
            bgm.volume = 0.3;
            bgm.play().then(() => {
                audioStarted = true;
                updateAudioButtonsUI();
            }).catch(() => { });
        }
    };

    function updateAudioButtonsUI() {
        if (bgmBtn) {
            if (isBgmEnabled) {
                bgmBtn.innerHTML = '<i class="fa-solid fa-music"></i> BGM ON';
                bgmBtn.style.background = 'linear-gradient(to bottom, #00897b, #004d40)';
                bgmBtn.style.borderColor = '#80cbc4';
            } else {
                bgmBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> BGM OFF';
                bgmBtn.style.background = '';
                bgmBtn.style.borderColor = '';
            }
        }
        if (seBtn) {
            if (isSeEnabled) {
                seBtn.innerHTML = '<i class="fa-solid fa-bell"></i> SE ON';
                seBtn.style.background = 'linear-gradient(to bottom, #f57c00, #e65100)';
                seBtn.style.borderColor = '#ffcc80';
            } else {
                seBtn.innerHTML = '<i class="fa-solid fa-bell-slash"></i> SE OFF';
                seBtn.style.background = '';
                seBtn.style.borderColor = '';
            }
        }
    }

    document.addEventListener('click', (e) => {
        handleInteraction();
        const trigger = e.target.closest('button, a, .menu-item, .stakeholder-card, .f-btn, .panel-tab, .btn-action');
        if (trigger) {
            const isNavLink = trigger.tagName === 'A' && trigger.getAttribute('href') && !trigger.getAttribute('href').startsWith('javascript:');
            if (isNavLink) {
                e.preventDefault();
                const url = trigger.getAttribute('href');
                playClickSound();
                setTimeout(() => { window.location.href = url; }, 100);
            } else {
                playClickSound();
            }
        }
    }, true);

    document.addEventListener('keydown', handleInteraction);

    if (bgmBtn && bgm) {
        bgmBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!bgm.paused) {
                bgm.pause();
                isBgmEnabled = false;
            } else {
                initAudioContext();
                bgm.play().catch(() => { });
                isBgmEnabled = true;
                audioStarted = true;
            }
            localStorage.setItem('bgm_enabled', isBgmEnabled);
            updateAudioButtonsUI();
        });
    }

    if (seBtn) {
        seBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isSeEnabled = !isSeEnabled;
            localStorage.setItem('se_enabled', isSeEnabled);
            updateAudioButtonsUI();
            if (isSeEnabled) playClickSound();
        });
    }

    updateAudioButtonsUI();

    // --- Quick Input Popover Logic ---
    const quickPopover = document.getElementById('quick-input-popover');
    const popBtns = [
        document.getElementById('pop-btn-0'),
        document.getElementById('pop-btn-1'),
        document.getElementById('pop-btn-2'),
        document.getElementById('pop-btn-3'),
        document.getElementById('pop-btn-4')
    ];
    let activeInput = null;
    let hideTimeout = null;

    const showPopover = (input) => {
        if (hideTimeout) clearTimeout(hideTimeout);
        activeInput = input;

        const prevVal = parseFloat(input.getAttribute('data-prev')) || 0;
        const currentVal = parseFloat(input.value) || prevVal;

        const choices = [
            { label: '-20%', val: Math.round(currentVal * 0.8) },
            { label: '-10%', val: Math.round(currentVal * 0.9) },
            { label: '前年並み', val: prevVal },
            { label: '+10%', val: Math.round(currentVal * 1.1) },
            { label: '+20%', val: Math.round(currentVal * 1.2) }
        ];

        // Format labels/values for small numbers
        if (currentVal > 0 && currentVal <= 10) {
            choices[0].label = '減 (-2)'; choices[0].val = Math.max(0, currentVal - 2);
            choices[1].label = '減 (-1)'; choices[1].val = Math.max(0, currentVal - 1);
            choices[3].label = '増 (+1)'; choices[3].val = currentVal + 1;
            choices[4].label = '増 (+2)'; choices[4].val = currentVal + 2;
        } else if (currentVal === 0) {
            choices[0].label = '0固定'; choices[0].val = 0;
            choices[1].label = 'min'; choices[1].val = 1;
            choices[4].label = '初期値'; choices[4].val = Math.max(10, Math.round(prevVal * 0.1) || 10);
        }

        choices.forEach((c, i) => {
            if (popBtns[i]) {
                popBtns[i].textContent = c.label;
                popBtns[i].onclick = (e) => {
                    e.stopPropagation();
                    input.value = c.val;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    // Refresh labels for "many times" clicking
                    showPopover(input);
                };
            }
        });

        // Position popover
        const rect = input.getBoundingClientRect();
        // Zoom adjustment: since body is zoomed, we need to account for it
        const currentZoom = parseFloat(document.body.style.zoom) || 1.0;

        quickPopover.style.display = 'flex';
        const popRect = quickPopover.getBoundingClientRect();

        // Final position calculation
        quickPopover.style.left = (rect.left + rect.width / 2 - popRect.width / 2) / currentZoom + 'px';
        quickPopover.style.top = (rect.top - popRect.height - 15) / currentZoom + 'px';
    };

    const hidePopover = () => {
        hideTimeout = setTimeout(() => {
            quickPopover.style.display = 'none';
            activeInput = null;
        }, 300);
    };

    // Delegate hover events for inputs
    document.addEventListener('mouseover', (e) => {
        const input = e.target.closest('.sheet-input');
        if (input) {
            showPopover(input);
        }
    });

    // --- Trend Chart Logic ---
    const trendWindow = document.getElementById('trend-chart-window');
    const trendCloseBtn = document.getElementById('trend-close-btn');
    const trendTitle = document.getElementById('trend-title');
    let trendChartObj = null;

    // --- Sheet Switcher Logic ---
    const switcherBtns = document.querySelectorAll('.switcher-btn');
    const sheetContainers = {
        goal: document.getElementById('sheet-content-goal'),
        decision: document.getElementById('sheet-content-decision'),
        forecast: document.getElementById('sheet-content-forecast')
    };

    switcherBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSheet = btn.getAttribute('data-sheet');

            // Update button states
            switcherBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show target container, hide others
            Object.keys(sheetContainers).forEach(key => {
                const container = sheetContainers[key];
                if (container) {
                    if (key === targetSheet) {
                        container.style.display = 'block';
                        container.style.animation = 'fadeIn 0.3s ease-out';
                    } else {
                        container.style.display = 'none';
                    }
                }
            });

            // If switching TO decision sheet, ensure at least one section is active
            if (targetSheet === 'decision') {
                const activeSection = document.querySelector('.sheet-section.active');
                if (!activeSection) {
                    const firstSection = document.querySelector('.sheet-section');
                    if (firstSection) firstSection.classList.add('active');
                }
            }
        });
    });

    const mockTrendData = {
        sales_plan: {
            title: '販売計画の推移',
            labels: ['1期', '2期', '3期', '4期', '5期'],
            datasets: [
                { label: '普及機', data: [450, 480, 500, 520, 500], color: '#4caf50' },
                { label: '中級機', data: [180, 190, 200, 210, 200], color: '#2196f3' },
                { label: '高級機', data: [80, 90, 100, 110, 100], color: '#ff9800' }
            ]
        },
        sales_price: {
            title: '販売価格の推移',
            labels: ['1期', '2期', '3期', '4期', '5期'],
            datasets: [
                { label: '普及機', data: [48000, 47000, 46000, 45000, 45000], color: '#4caf50' },
                { label: '中級機', data: [85000, 83000, 81000, 80000, 80000], color: '#2196f3' },
                { label: '高級機', data: [130000, 125000, 122000, 120000, 120000], color: '#ff9800' }
            ]
        },
        promo: {
            title: '販促費の推移',
            labels: ['1期', '2期', '3期', '4期', '5期'],
            datasets: [
                { label: '普及機', data: [4, 5, 5, 6, 5], color: '#4caf50' },
                { label: '中級機', data: [7, 8, 8, 9, 8], color: '#2196f3' },
                { label: '高級機', data: [9, 10, 10, 12, 10], color: '#ff9800' }
            ]
        },
        ad: {
            title: '広告宣伝費の推移',
            labels: ['1期', '2期', '3期', '4期', '5期'],
            datasets: [
                { label: '広告宣伝費', data: [12, 14, 15, 18, 15], color: '#e91e63' }
            ]
        },
        mfg_plan: {
            title: '製造計画の推移',
            labels: ['1期', '2期', '3期', '4期', '5期'],
            datasets: [
                { label: '普及機', data: [380, 400, 420, 410, 400], color: '#4caf50' },
                { label: '中級機', data: [140, 150, 160, 155, 150], color: '#2196f3' },
                { label: '高級機', data: [70, 75, 80, 85, 80], color: '#ff9800' }
            ]
        }
    };

    const openTrendChart = (type) => {
        const data = mockTrendData[type] || { title: 'データ推移', labels: [], datasets: [] };
        trendTitle.textContent = data.title;
        trendWindow.style.display = 'flex';

        if (trendChartObj) trendChartObj.destroy();

        const ctx = document.getElementById('trendChart').getContext('2d');
        trendChartObj = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: data.datasets.map(ds => ({
                    label: ds.label,
                    data: ds.data,
                    borderColor: ds.color,
                    backgroundColor: ds.color + '22',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 14, weight: 'bold' } } }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { font: { size: 12 } } },
                    x: { ticks: { font: { size: 12, weight: 'bold' } } }
                }
            }
        });
    };

    document.querySelectorAll('.group-chart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const type = btn.getAttribute('data-trend');
            openTrendChart(type);
        });
    });

    if (trendCloseBtn) {
        trendCloseBtn.addEventListener('click', () => {
            trendWindow.style.display = 'none';
        });
    }

    document.addEventListener('mouseout', (e) => {
        const input = e.target.closest('.sheet-input');
        if (input) {
            hidePopover();
        }
    });

    if (quickPopover) {
        quickPopover.addEventListener('mouseenter', () => {
            if (hideTimeout) clearTimeout(hideTimeout);
        });

        quickPopover.addEventListener('mouseleave', () => {
            hidePopover();
        });
    }


    // --- Existing UI Logic ---
    const secretaryAvatar = document.querySelector('.secretary-avatar');
    if (secretaryAvatar) {
        const removeBackground = (imgElement) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = imgElement.naturalWidth;
            canvas.height = imgElement.naturalHeight;
            ctx.drawImage(imgElement, 0, 0);
            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const width = canvas.width;
                const height = canvas.height;
                const visited = new Uint8Array(width * height);
                const stack = [];
                for (let x = 0; x < width; x++) stack.push([x, 0], [x, height - 1]);
                for (let y = 0; y < height; y++) stack.push([0, y], [width - 1, y]);
                while (stack.length > 0) {
                    const [x, y] = stack.pop();
                    const idx = y * width + x;
                    if (x < 0 || x >= width || y < 0 || y >= height || visited[idx]) continue;
                    const p = idx * 4;
                    if (data[p] > 245 && data[p + 1] > 245 && data[p + 2] > 245) {
                        visited[idx] = 1;
                        data[p + 3] = 0;
                        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
                    }
                }
                ctx.putImageData(imageData, 0, 0);
                return canvas.toDataURL();
            } catch (e) { return imgElement.src; }
        };

        const initBlinking = async () => {
            const openEyesData = removeBackground(secretaryAvatar);
            secretaryAvatar.src = openEyesData;
            const blinkImg = new Image();
            blinkImg.src = 'secretary_blink.png';
            blinkImg.onload = () => {
                const closedEyesData = removeBackground(blinkImg);
                const blinkLoop = () => {
                    secretaryAvatar.src = closedEyesData;
                    setTimeout(() => { secretaryAvatar.src = openEyesData; }, 150);
                    setTimeout(blinkLoop, 3000 + Math.random() * 4000);
                };
                setTimeout(blinkLoop, 2000);
            };
        };
        if (secretaryAvatar.complete) initBlinking();
        else secretaryAvatar.addEventListener('load', initBlinking, { once: true });
    }

    const stakeholderCards = document.querySelectorAll('.stakeholder-card');
    const commentWindow = document.getElementById('stakeholder-comment');
    stakeholderCards.forEach(card => {
        card.addEventListener('click', () => {
            stakeholderCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const comment = card.getAttribute('data-comment');
            const name = card.getAttribute('data-name');
            const affinity = parseInt(card.getAttribute('data-affinity') || "0");

            // Calculate Performance Bonus based on affinity
            let bonusText = "";
            let bonusClass = "";
            if (affinity >= 5) { bonusText = "【絶好調】意思決定効率 +25%"; bonusClass = "status-perfect"; }
            else if (affinity >= 4) { bonusText = "【良好】意思決定効率 +15%"; bonusClass = "status-good"; }
            else if (affinity >= 3) { bonusText = "【普通】意思決定効率 +5%"; bonusClass = "status-normal"; }
            else { bonusText = "【低迷】ボーナスなし"; bonusClass = "status-low"; }

            if (commentWindow) {
                commentWindow.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
                        <span class="affinity-bonus-tag ${bonusClass}">${bonusText}</span>
                        <strong style="color:#00bcd4; font-size:1.1em;">${name}</strong>
                    </div>
                    <div style="font-size:1.05em; line-height:1.5;">「${comment}」</div>
                `;
            }
        });
    });

    // --- Information Gathering View Switching ---
    const footerBtns = document.querySelectorAll('.footer-menu .f-btn[data-view]');
    const infoViews = document.querySelectorAll('.info-view');
    const dialogBox = document.querySelector('.dialog-box');

    footerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetViewId = btn.getAttribute('data-view');
            const viewInfo = btn.getAttribute('data-info');

            // Update footer buttons UI
            footerBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update Left Side Views
            infoViews.forEach(view => {
                view.classList.remove('active');
                if (view.id === targetViewId) {
                    view.classList.add('active');
                }
            });

            // Update Stakeholder Comment Window Visibility
            if (commentWindow) {
                if (targetViewId === 'view-gathering') {
                    commentWindow.style.display = 'block';
                } else {
                    commentWindow.style.display = 'none';
                }
            }

            // Update Secretary Dialog if info exists
            if (dialogBox && viewInfo) {
                dialogBox.innerHTML = `社長、${viewInfo}<i class="fa-solid fa-comment-dots" style="margin-left:5px; color:#00bcd4;"></i>`;
            } else if (dialogBox && targetViewId === 'view-gathering') {
                dialogBox.innerHTML = `社長、情報収集の準備は整っております。<br>進捗を確認しましょう。<i class="fa-solid fa-comment-dots" style="margin-left:5px; color:#00bcd4;"></i>`;
            }

            // Update Sub-Header Title
            const viewTitle = document.getElementById('current-view-title');
            const viewIcon = document.getElementById('current-view-icon');
            const btnLabel = btn.querySelector('.f-label').textContent;
            const btnIconClass = btn.querySelector('.f-icon').className;

            if (viewTitle) viewTitle.textContent = btnLabel;
            if (viewIcon) viewIcon.className = btnIconClass;

            console.log('Switched left view to:', targetViewId);
        });
    });

    // --- Decision Panel Tab Switching ---
    const menuItems = document.querySelectorAll('.decision-panel .menu-item');
    const sheetSections = document.querySelectorAll('.sheet-section');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-tab');
            if (!targetId) return;

            // Update Menu Items UI
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            // Update Sheet Sections visibility
            sheetSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });

            console.log('Switched to tab:', targetId);
        });
    });

    // --- Dynamic Percentage calculation ---
    const sheetInputs = document.querySelectorAll('.sheet-input');
    sheetInputs.forEach(input => {
        input.addEventListener('input', () => {
            const currentVal = parseFloat(input.value);
            const prevValString = input.getAttribute('data-prev');
            const prevVal = prevValString ? parseFloat(prevValString) : NaN;
            const diffSpan = input.parentElement.querySelector('.diff-percent');

            if (!diffSpan) return;

            if (isNaN(currentVal) || isNaN(prevVal) || prevVal === 0) {
                diffSpan.textContent = '';
                diffSpan.className = 'diff-percent';
                return;
            }

            const percentChange = ((currentVal - prevVal) / prevVal) * 100;
            const formattedPercent = Math.round(percentChange);

            let sign = "";
            let statusClass = "neutral";

            if (percentChange > 0) {
                sign = "+";
                statusClass = "positive";
            } else if (percentChange < 0) {
                sign = ""; // Negative sign is included in the number
                statusClass = "negative";
            }

            diffSpan.textContent = ` (${sign}${formattedPercent}%)`;
            diffSpan.className = `diff-percent ${statusClass}`;

            // --- Update Overall Progress ---
            updateOverallProgress();
        });
    });

    // Helper to check progress
    function updateOverallProgress() {
        const totalInputs = sheetInputs.length;
        if (totalInputs === 0) return;

        // Count inputs that have a valid number value (and not just empty)
        // For this demo, we assume any non-empty string is 'filled'
        // If pre-filled, we might need a different logic, but let's start here.
        let filledCount = 0;
        sheetInputs.forEach(inp => {
            if (inp.value && inp.value.trim() !== "") {
                filledCount++;
            }
        });

        // Calculate percentage
        let percentage = Math.floor((filledCount / totalInputs) * 100);

        // Debug/Demo Mode: If logic is too strict, just ensure it works visually
        // console.log(`Progress: ${filledCount}/${totalInputs} = ${percentage}%`);

        // Update UI
        const progressBar = document.querySelector('.overall-progress-bar');
        const progressText = document.querySelector('.overall-progress-text');
        const decisionBtn = document.getElementById('final-decision-btn');
        const btnProgressBar = document.querySelector('.btn-progress-bar');
        const btnProgressText = document.querySelector('.btn-progress-text');

        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
        if (btnProgressBar) btnProgressBar.style.width = `${percentage}%`;
        if (btnProgressText) btnProgressText.textContent = `${percentage}%`;

        if (decisionBtn) {
            if (percentage >= 100) {
                decisionBtn.removeAttribute('disabled');
            } else {
                decisionBtn.setAttribute('disabled', 'true');
            }
        }
    }

    // --- Transition to Processing Scene ---
    const finalDecisionBtn = document.getElementById('final-decision-btn');
    if (finalDecisionBtn) {
        finalDecisionBtn.addEventListener('click', () => {
            // Even if disabled for logic, we can allow for demo if desired, 
            // but usually we check if it's disabled.
            if (!finalDecisionBtn.hasAttribute('disabled')) {
                window.location.href = 'processing.html';
            }
        });
    }

    // --- Auto-fill for 100% Progress Demonstration ---
    function autoFillDecisionSheet() {
        const sheetInputs = document.querySelectorAll('.sheet-input');
        sheetInputs.forEach(input => {
            if (input.tagName === 'SELECT') {
                // Keep default or set to first option if needed
            } else {
                const prevVal = input.getAttribute('data-prev');
                if (prevVal) {
                    input.value = prevVal;
                } else if (!input.value) {
                    input.value = "0";
                }
            }
            // Trigger input event to update calculations and progress
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        console.log("Decision Sheet auto-filled for 100% progress.");
    }

    // Run auto-fill on load
    autoFillDecisionSheet();

    // --- Real-time Forecast Calculation System (Excel Logic Port) ---
    const calcInputs = [
        'input-sales-qty-std', 'input-sales-qty-mid', 'input-sales-qty-high',
        'input-sales-price-std', 'input-sales-price-mid', 'input-sales-price-high',
        'input-promo-std', 'input-promo-mid', 'input-promo-high', 'input-ad-total',
        'input-mfg-qty-std', 'input-mfg-qty-mid', 'input-mfg-qty-high',
        'input-mfg-cost-maint', 'input-mfg-cost-qc', 'input-mfg-cost-expansion', 'input-mfg-cost-edu',
        // HR
        'input-hr-hire-mfg', 'input-hr-salary-mfg', 'input-hr-hire-mfg-mgr', 'input-hr-salary-mfg-mgr',
        'input-hr-hire-sales', 'input-hr-salary-sales', 'input-hr-hire-sales-mgr', 'input-hr-salary-sales-mgr',
        'input-hr-edu-sales', 'input-hr-edu-mfg',
        // Finance
        'input-fin-short-loan', 'input-fin-long-loan', 'input-fin-repay-long-1', 'input-fin-repay-long-2',
        'input-fin-capital', 'input-fin-dividend'
    ];

    function calculateForecast() {
        // Helper to get value securely
        const getVal = (id) => {
            const el = document.getElementById(id);
            if (!el) return 0;
            // Handle select inputs if necessary, currently sticking to number inputs
            const val = parseFloat(el.value);
            return isNaN(val) ? 0 : val;
        };

        // --- 1. Revenue Calculation (Sales) ---
        // Formula: Sum(Qty * Price) / 1,000,000 (to Million Yen)
        const salesStd = getVal('input-sales-qty-std') * getVal('input-sales-price-std');
        const salesMid = getVal('input-sales-qty-mid') * getVal('input-sales-price-mid');
        const salesHigh = getVal('input-sales-qty-high') * getVal('input-sales-price-high');

        const totalRevenue = (salesStd + salesMid + salesHigh) / 1000000;

        // --- 2. Cost Calculation (Direct Costs) ---
        // Assumption: Cost Rate per model (can be adjusting by formulas later)
        // Std: 45000 * 0.6 = 27000? Let's assume fixed unit base cost.
        const costPerUnitStd = 20000;
        const costPerUnitMid = 35000;
        const costPerUnitHigh = 50000;

        const cogs = (getVal('input-mfg-qty-std') * costPerUnitStd) +
            (getVal('input-mfg-qty-mid') * costPerUnitMid) +
            (getVal('input-mfg-qty-high') * costPerUnitHigh);
        const totalCogs = cogs / 1000000;

        // --- 3. Expenses ---
        const promo = getVal('input-promo-std') + getVal('input-promo-mid') + getVal('input-promo-high'); // Million
        const ad = getVal('input-ad-total'); // Million

        const mfgFixed = getVal('input-mfg-cost-maint') + getVal('input-mfg-cost-qc') + getVal('input-mfg-cost-edu'); // Million
        const hrEdu = getVal('input-hr-edu-sales') + getVal('input-hr-edu-mfg'); // Million

        // Labor Cost (Simplified Estimation)
        // (Salary * Headcount)
        // Base Headcount: Mfg=50, Sales=30 (Example)
        const laborMfg = ((getVal('input-hr-salary-mfg') * (50 + getVal('input-hr-hire-mfg')))) / 1000; // to Million
        const laborSales = ((getVal('input-hr-salary-sales') * (30 + getVal('input-hr-hire-sales')))) / 1000; // to Million
        const laborTotal = laborMfg + laborSales;

        const totalExpenses = promo + ad + mfgFixed + hrEdu + laborTotal;

        // --- 4. Operating Profit ---
        const opProfit = totalRevenue - totalCogs - totalExpenses;

        // --- 5. Cash Balance (Forecast) ---
        const startCash = 300; // Example Opening Balance
        const loans = getVal('input-fin-short-loan') + getVal('input-fin-long-loan') + getVal('input-fin-capital');
        const repayments = getVal('input-fin-repay-long-1') + getVal('input-fin-repay-long-2') + getVal('input-fin-dividend');

        // Capex: Assume 50 Million per Expansion Unit
        const capex = getVal('input-mfg-cost-expansion') * 50;

        // Cash Flow ≈ OpProfit + Loans - Repayments - Capex
        // (Ignoring depreciation/tax/interest for simple simulator)
        const endCash = startCash + opProfit + loans - repayments - capex;

        // --- Update UI ---
        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = Math.round(val).toLocaleString();
                // Color coding
                if (val < 0) el.style.color = '#ff5252'; // Red for negative
                else if (id === 'val-forecast-profit') el.style.color = '#ffeb3b';
                else if (id === 'val-forecast-sales') el.style.color = '#00e5ff';
                else if (id === 'val-forecast-cash') el.style.color = '#00bcd4';
            }
        };

        setTxt('val-forecast-sales', totalRevenue);
        setTxt('val-forecast-profit', opProfit);
        setTxt('val-forecast-cash', endCash);
    }

    // Attach listeners
    calcInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', calculateForecast);
    });

    // Run once to init
    // calculateForecast();

    // --- Link Analysis Buttons to Simulation Page ---
    document.querySelectorAll('.analysis-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent other click events

            // Gather all input values
            const inputs = {};
            document.querySelectorAll('.sheet-input').forEach(input => {
                if (input.id) {
                    // Save both value and the 'prev' data attribute for comparison if needed
                    inputs[input.id] = input.value;
                }
            });

            // Save to localStorage
            localStorage.setItem('bizExInputs', JSON.stringify(inputs));

            // Navigate
            window.location.href = 'simulation.html';
        });
    });

    // Initialize progress with animation
    setTimeout(() => {
        // Overall Progress Bar Animation
        const progressBar = document.querySelector('.overall-progress-bar');
        const progressText = document.querySelector('.overall-progress-text');
        const btnProgressBar = document.querySelector('.btn-progress-bar');
        const btnProgressText = document.querySelector('.btn-progress-text');

        // Individual Menu Progress Bars Animation
        const menuBars = document.querySelectorAll('.menu-item-progress-bar');
        const originalWidths = [];

        // 1. Store original widths and Animate to 100%
        if (progressBar) progressBar.style.width = '100%';
        if (progressText) progressText.textContent = '100%';
        if (btnProgressBar) btnProgressBar.style.width = '100%';
        if (btnProgressText) btnProgressText.textContent = '100%';

        menuBars.forEach((bar, index) => {
            originalWidths[index] = bar.style.width; // Save actual progress
            bar.style.width = '100%';
        });

        // 2. Revert to actual value after a delay
        setTimeout(() => {
            updateOverallProgress(); // Revert overall bar

            menuBars.forEach((bar, index) => {
                bar.style.width = originalWidths[index]; // Revert individual bars
            });
        }, 800);
    }, 500);
});

// --- Calculator Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const calcWindow = document.getElementById('draggable-calc');
    const calcTrigger = document.getElementById('calc-trigger');
    const calcClose = document.getElementById('calc-close');
    const calcMain = document.getElementById('calc-main');
    const calcPrev = document.getElementById('calc-prev');
    const calcHeader = document.querySelector('.calc-header');

    if (!calcWindow || !calcTrigger) return;

    let currentInput = "0";
    let previousInput = "";
    let operator = null;

    // --- Show/Hide ---
    calcTrigger.addEventListener('click', () => {
        calcWindow.style.display = calcWindow.style.display === 'flex' ? 'none' : 'flex';
    });

    calcClose.addEventListener('click', () => {
        calcWindow.style.display = 'none';
    });

    // --- Dragging Logic ---
    let isDragging = false;
    let offsetX, offsetY;

    calcHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - calcWindow.offsetLeft;
        offsetY = e.clientY - calcWindow.offsetTop;
        calcWindow.style.opacity = "0.9";
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        calcWindow.style.left = (e.clientX - offsetX) + 'px';
        calcWindow.style.top = (e.clientY - offsetY) + 'px';
        calcWindow.style.bottom = 'auto'; // Break free from initial fixed positioning
        calcWindow.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        calcWindow.style.opacity = "1";
    });

    // --- Calculation Logic ---
    const updateDisplay = () => {
        calcMain.textContent = currentInput;
        calcPrev.textContent = previousInput + (operator ? ` ${operator}` : "");
    };

    const calculate = () => {
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        if (isNaN(prev) || isNaN(current)) return;

        let result;
        switch (operator) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '*': result = prev * current; break;
            case '/': result = current === 0 ? "Error" : prev / current; break;
            default: return;
        }
        currentInput = result.toString();
        operator = null;
        previousInput = "";
    };

    document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const num = btn.getAttribute('data-num');
            const op = btn.getAttribute('data-op');

            if (num !== null) {
                if (currentInput === "0" && num !== ".") {
                    currentInput = num;
                } else if (num === "." && currentInput.includes(".")) {
                    return;
                } else {
                    currentInput += num;
                }
            } else if (op !== null) {
                if (op === "C") {
                    currentInput = "0";
                    previousInput = "";
                    operator = null;
                } else if (op === "delete") {
                    currentInput = currentInput.slice(0, -1) || "0";
                } else if (op === "=") {
                    calculate();
                } else {
                    if (previousInput !== "") calculate();
                    operator = op;
                    previousInput = currentInput;
                    currentInput = "0";
                }
            }
            updateDisplay();
        });
    });
});

// --- Memo Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const memoWindow = document.getElementById('draggable-memo');
    const memoTrigger = document.getElementById('memo-trigger');
    const memoClose = document.getElementById('memo-close');
    const memoTextArea = document.getElementById('memo-textarea');
    const memoHeader = document.querySelector('.memo-header');

    if (!memoWindow || !memoTrigger) return;

    // --- Load Content ---
    const savedMemo = localStorage.getItem('biz_ex_memo');
    if (savedMemo) {
        memoTextArea.value = savedMemo;
    }

    // --- Save Content ---
    memoTextArea.addEventListener('input', () => {
        localStorage.setItem('biz_ex_memo', memoTextArea.value);
    });

    // --- Show/Hide ---
    memoTrigger.addEventListener('click', () => {
        memoWindow.style.display = memoWindow.style.display === 'flex' ? 'none' : 'flex';
    });

    memoClose.addEventListener('click', () => {
        memoWindow.style.display = 'none';
    });

    // --- Dragging Logic ---
    let isDragging = false;
    let offsetX, offsetY;

    memoHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - memoWindow.offsetLeft;
        offsetY = e.clientY - memoWindow.offsetTop;
        memoWindow.style.opacity = "0.9";
        memoWindow.style.zIndex = "1001"; // Bring to front when dragging
        if (document.getElementById('draggable-calc')) document.getElementById('draggable-calc').style.zIndex = "1000";
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        memoWindow.style.left = (e.clientX - offsetX) + 'px';
        memoWindow.style.top = (e.clientY - offsetY) + 'px';
        memoWindow.style.bottom = 'auto';
        memoWindow.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        memoWindow.style.opacity = "1";
    });
});

// --- Language Selection Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const langWindow = document.getElementById('draggable-lang');
    const langTrigger = document.getElementById('lang-trigger');
    const langClose = document.getElementById('lang-close');
    const langSearch = document.getElementById('lang-search');
    const langList = document.getElementById('lang-list');
    const langSave = document.getElementById('lang-save');
    const langHeader = document.querySelector('.lang-header');

    if (!langWindow || !langTrigger) return;

    // Load saved language
    const savedLang = localStorage.getItem('biz_ex_selected_language') || 'ja';
    const savedLangName = localStorage.getItem('biz_ex_selected_language_name') || '日本語';

    // Update button text if needed
    if (savedLang !== 'ja') {
        langTrigger.innerHTML = `<i class="fa-solid fa-globe"></i> ${savedLangName} / Language`;
    }

    // Toggle
    langTrigger.addEventListener('click', () => {
        langWindow.style.display = langWindow.style.display === 'flex' ? 'none' : 'flex';
        langWindow.style.zIndex = "1015";
    });

    langClose.addEventListener('click', () => {
        langWindow.style.display = 'none';
    });

    // Search Filtering
    langSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = langList.getElementsByClassName('lang-item');
        Array.from(items).forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(term) ? 'block' : 'none';
        });
    });

    // Selection
    langList.addEventListener('click', (e) => {
        if (e.target.classList.contains('lang-item')) {
            const items = langList.getElementsByClassName('lang-item');
            Array.from(items).forEach(item => item.classList.remove('active'));
            e.target.classList.add('active');
        }
    });

    // Save/Apply
    langSave.addEventListener('click', () => {
        const activeItem = langList.querySelector('.lang-item.active');
        if (activeItem) {
            const langCode = activeItem.dataset.lang;
            const langName = activeItem.textContent.split(' (')[0]; // Get display name
            localStorage.setItem('biz_ex_selected_language', langCode);
            localStorage.setItem('biz_ex_selected_language_name', langName);

            langTrigger.innerHTML = `<i class="fa-solid fa-globe"></i> ${langName} / Language`;

            // Trigger UI translation update
            updateTranslations(langCode);

            // Show feedback
            langSave.textContent = 'Apply Success!';
            setTimeout(() => {
                langSave.textContent = '適用 / Apply';
                langWindow.style.display = 'none';
            }, 800);
        }
    });

    // Dragging
    let isDragging = false;
    let offsetX, offsetY;

    langHeader.addEventListener('mousedown', (e) => {
        if (e.target.closest('.lang-close')) return;
        isDragging = true;
        offsetX = e.clientX - langWindow.offsetLeft;
        offsetY = e.clientY - langWindow.offsetTop;
        langWindow.style.opacity = "0.9";
        langWindow.style.zIndex = "1015";
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        langWindow.style.left = (e.clientX - offsetX) + 'px';
        langWindow.style.top = (e.clientY - offsetY) + 'px';
        langWindow.style.bottom = 'auto';
        langWindow.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        langWindow.style.opacity = "1";
    });
});

// --- Stock Chart Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const chartWindow = document.getElementById('draggable-stock-chart');
    const chartTrigger = document.getElementById('stock-chart-trigger');
    const chartClose = document.getElementById('chart-close');
    const chartHeader = document.querySelector('.chart-header');

    if (!chartWindow || !chartTrigger) return;

    let stockChart = null;
    let currentChartType = 'market_cap';

    const chartDataSets = {
        market_cap: {
            label: '時価総額 (億円)',
            data: [1200, 1350, 1300, 1500, 1800, 1750, 2100, 2500, 2400, 3100, 4200, 4000, 4600, 5000, 5000],
            unit: '億円',
            color: '#00e5ff',
            type: 'line'
        },
        stock_price: {
            label: '株価 (円)',
            data: [100, 110, 105, 120, 135, 130, 145, 160, 155, 180, 210, 205, 230, 250, 250],
            unit: '円',
            color: '#ff9800',
            type: 'line'
        },
        shares: {
            label: '発行済株式 (万株)',
            data: [1200, 1200, 1200, 1250, 1333, 1333, 1448, 1562, 1562, 1722, 2000, 2000, 2000, 2000, 2000],
            unit: '万株',
            color: '#4caf50',
            type: 'line'
        },
        shareholders: {
            label: '株主構成 (%)',
            data: [45, 12, 18, 20, 5],
            labels: ['オーナー', '従業員持ち株会', '一般株主', '機関投資家', '敵対的買収者'],
            colors: ['#00bcd4', '#4caf50', '#ff9800', '#9c27b0', '#f44336'],
            type: 'doughnut'
        }
    };

    const initChart = (type = 'market_cap') => {
        const ctx = document.getElementById('stockChart').getContext('2d');
        const set = chartDataSets[type];

        let config;
        if (set.type === 'line') {
            config = {
                type: 'line',
                data: {
                    labels: ['第1期', '第2期', '第3期', '第4期', '第5期', '第6期', '第7期', '第8期', '第9期', '第10期', '第11期', '第12期', '第13期', '第14期', '第15期'],
                    datasets: [{
                        label: set.label,
                        data: set.data,
                        borderColor: set.color,
                        backgroundColor: `${set.color}1A`,
                        borderWidth: 4,
                        pointBackgroundColor: set.color,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    animation: { duration: 500 },
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: `単位：${set.unit}`,
                                color: '#666',
                                font: { size: 16, weight: 'bold' }
                            },
                            ticks: {
                                font: { size: 14, weight: 'bold' },
                                padding: 10
                            },
                            grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        x: {
                            ticks: {
                                font: { size: 14, weight: 'bold' },
                                padding: 10
                            },
                            grid: { display: false }
                        }
                    }
                }
            };
        } else {
            config = {
                type: 'doughnut',
                data: {
                    labels: set.labels,
                    datasets: [{
                        data: set.data,
                        backgroundColor: set.colors,
                        borderWidth: 0,
                        hoverOffset: 20
                    }]
                },
                options: {
                    responsive: true,
                    animation: { duration: 800, animateRotate: true },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'right',
                            labels: {
                                color: '#333',
                                font: { weight: 'bold', size: 24 },
                                padding: 25
                            }
                        },
                        title: {
                            display: false
                        }
                    },
                    layout: {
                        padding: 30
                    },
                    cutout: '60%'
                }
            };
        }

        if (stockChart) stockChart.destroy();
        stockChart = new Chart(ctx, config);
    };

    // --- Tab Switching ---
    document.querySelectorAll('.chart-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.getAttribute('data-type');
            if (type === currentChartType) return;

            document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentChartType = type;
            initChart(type);
        });
    });

    // --- Show/Hide ---
    chartTrigger.addEventListener('click', () => {
        const isVisible = chartWindow.style.display === 'flex';
        chartWindow.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) initChart(currentChartType);
    });

    chartClose.addEventListener('click', () => {
        chartWindow.style.display = 'none';
    });

    // --- Dragging Logic ---
    let isDragging = false;
    let offsetX, offsetY;

    chartHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - chartWindow.offsetLeft;
        offsetY = e.clientY - chartWindow.offsetTop;
        chartWindow.style.opacity = "0.9";
        chartWindow.style.zIndex = "1101";
        // Reset others
        if (document.getElementById('draggable-calc')) document.getElementById('draggable-calc').style.zIndex = "1000";
        if (document.getElementById('draggable-memo')) document.getElementById('draggable-memo').style.zIndex = "999";
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        chartWindow.style.left = (e.clientX - offsetX) + 'px';
        chartWindow.style.top = (e.clientY - offsetY) + 'px';
        chartWindow.style.bottom = 'auto';
        chartWindow.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        chartWindow.style.opacity = "1";
    });
    // --- Corporate Culture Point Allocation Logic ---
    const TOTAL_POINTS = 10;
    const remainingDisplay = document.getElementById('remaining-points');
    const cultureItems = document.querySelectorAll('.culture-item');
    let cultureChartInstance = null;

    function initCultureChart() {
        const ctx = document.getElementById('cultureChart');
        if (!ctx) return;

        const labels = ['利益最大化', '顧客価値', '技術・品質', '社会貢献', '人・組織'];
        const data = {
            labels: labels,
            datasets: [{
                label: '経営スタンス',
                data: [0, 0, 0, 0, 0],
                fill: true,
                backgroundColor: 'rgba(0, 229, 255, 0.2)',
                borderColor: '#00e5ff',
                pointBackgroundColor: '#00e5ff',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#00e5ff'
            }]
        };

        const config = {
            type: 'radar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: {
                            color: '#fff',
                            font: { size: 24, weight: 'bold' }
                        },
                        ticks: {
                            display: false,
                            stepSize: 2,
                            max: 10
                        },
                        suggestedMin: 0,
                        suggestedMax: 10
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        };

        cultureChartInstance = new Chart(ctx, config);
    }

    // Simulated Base Cumulative Points (from previous years)
    let baseCumulativePoints = {
        'financial': 0,
        'customer': 0,
        'product': 0,
        'purpose': 0,
        'people': 0
    };

    function updatePoints() {
        let currentTotal = 0;
        const inputs = document.querySelectorAll('.point-input');
        inputs.forEach(input => {
            currentTotal += parseInt(input.value) || 0;
        });

        const remaining = TOTAL_POINTS - currentTotal;
        if (remainingDisplay) {
            remainingDisplay.textContent = remaining;
            remainingDisplay.style.color = remaining === 0 ? '#4caf50' : (remaining < 0 ? '#ff5252' : '#00e5ff');
        }

        // Update button states
        document.querySelectorAll('.culture-item').forEach(item => {
            const input = item.querySelector('.point-input');
            const val = parseInt(input.value) || 0;
            const plusBtn = item.querySelector('.plus');
            const minusBtn = item.querySelector('.minus');

            if (plusBtn) plusBtn.disabled = (remaining <= 0);
            if (minusBtn) minusBtn.disabled = (val <= 0);
        });

        // Update Chart & Cumulative Boxes
        if (cultureChartInstance) {
            const typesOrder = ['financial', 'customer', 'product', 'purpose', 'people'];

            const newData = [];

            typesOrder.forEach(type => {
                const input = document.querySelector(`.culture-item[data-type="${type}"] .point-input`);
                const currentVal = parseInt(input ? input.value : 0);
                const totalVal = (baseCumulativePoints[type] || 0) + currentVal;

                // Update Chart Data (Current Input Shape)
                newData.push(currentVal);

                // Update Cumulative Box
                const box = document.querySelector(`.c-box[data-type="${type}"] .c-value`);
                if (box) {
                    box.textContent = totalVal + " pt";
                }
            });

            cultureChartInstance.data.datasets[0].data = newData;
            cultureChartInstance.update();
        }

        // Update Card Progress Bar (Combined: Philosophy + Culture)
        const consumed = TOTAL_POINTS - remaining;

        const card = document.querySelector('.strategy-textarea')?.closest('.strategy-card');
        if (card) {
            updateUnifiedProgress(card);
        }

        // Save to LocalStorage
        const cultureData = {};
        inputs.forEach(input => {
            const type = input.closest('.culture-item').getAttribute('data-type');
            cultureData[type] = input.value;
        });
        localStorage.setItem('bizex_culture_allocation', JSON.stringify(cultureData));
    }

    function updateUnifiedProgress(card) {
        const textarea = card.querySelector('.strategy-textarea');
        const progressFill = card.querySelector('.card-progress-fill');
        const progressLabel = card.querySelector('.card-progress-label');

        if (!textarea || !progressFill || !progressLabel) return;

        // 1. Philosophy Progress (0 or 50)
        const hasText = textarea.value.trim().length > 0;
        const philScore = hasText ? 50 : 0;

        // 2. Culture Progress (0 to 50)
        let currentPoints = 0;
        document.querySelectorAll('.point-input').forEach(i => currentPoints += parseInt(i.value) || 0);
        const cultureScore = (currentPoints / 10) * 50;

        const totalPercent = philScore + cultureScore;
        progressFill.style.width = `${totalPercent}%`;

        // Label logic
        if (totalPercent === 100) {
            progressLabel.textContent = '策定完了';
            progressLabel.style.color = '#00e5ff';
        } else if (totalPercent > 0) {
            progressLabel.textContent = '策定中';
            progressLabel.style.color = '#ffeb3b';
        } else {
            progressLabel.textContent = '未入力';
            progressLabel.style.color = '#aaa';
        }
    }

    cultureItems.forEach(item => {
        const plusBtn = item.querySelector('.plus');
        const minusBtn = item.querySelector('.minus');
        const input = item.querySelector('.point-input');

        if (plusBtn) {
            plusBtn.addEventListener('click', () => {
                let val = parseInt(input.value) || 0;
                let currentTotal = 0;
                document.querySelectorAll('.point-input').forEach(i => currentTotal += parseInt(i.value) || 0);

                if (currentTotal < TOTAL_POINTS) {
                    input.value = val + 1;
                    updatePoints();
                }
            });
        }

        if (minusBtn) {
            minusBtn.addEventListener('click', () => {
                let val = parseInt(input.value) || 0;
                if (val > 0) {
                    input.value = val - 1;
                    updatePoints();
                }
            });
        }
    });

    // Initialize Chart on load
    initCultureChart();

    // Load saved data
    const savedCulture = localStorage.getItem('bizex_culture_allocation');
    if (savedCulture) {
        const data = JSON.parse(savedCulture);
        Object.keys(data).forEach(type => {
            const item = document.querySelector(`.culture-item[data-type="${type}"]`);
            if (item) {
                const input = item.querySelector('.point-input');
                if (input) input.value = data[type];
            }
        });
        updatePoints();
    }

    // --- Management Plan Visual Input Logic ---
    let marketChart = null;
    let shareChart = null;
    let profitChart = null;

    // Midterm Charts
    let midMarketChart = null;
    let midSalesChart = null;
    let midProfitChart = null;
    let midAssetsChart = null;

    function initManagementPlanCharts() {
        // 1. Market Size Forecast Chart
        const marketCtx = document.getElementById('chart-market-forecast');
        if (marketCtx) {
            marketChart = new Chart(marketCtx, {
                type: 'bar',
                data: {
                    labels: ['前期実績', '次期予測'],
                    datasets: [{
                        label: '市場規模 (億円)',
                        data: [1950, 2000],
                        backgroundColor: [
                            'rgba(255, 255, 255, 0.2)',
                            '#00e5ff'
                        ],
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderWidth: 1,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { color: '#aaa', font: { size: 10 } }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#fff', font: { weight: 'bold', size: 11 } }
                        }
                    }
                }
            });
        }

        // 2. Share Target Chart (Radial/Doughnut)
        const shareCtx = document.getElementById('chart-share-target');
        if (shareCtx) {
            shareChart = new Chart(shareCtx, {
                type: 'doughnut',
                data: {
                    labels: ['目標', '残り'],
                    datasets: [{
                        data: [0, 100],
                        backgroundColor: ['#00e5ff', 'rgba(255, 255, 255, 0.05)'],
                        borderWidth: 0,
                        circumference: 180,
                        rotation: 270
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '80%',
                    plugins: { legend: { display: false }, tooltip: { enabled: false } }
                }
            });
        }

        // 3. Profit Margin Chart (Radial/Doughnut)
        const profitCtx = document.getElementById('chart-profit-target');
        if (profitCtx) {
            profitChart = new Chart(profitCtx, {
                type: 'doughnut',
                data: {
                    labels: ['目標', '残り'],
                    datasets: [{
                        data: [0, 100],
                        backgroundColor: ['#ffeb3b', 'rgba(255, 255, 255, 0.05)'],
                        borderWidth: 0,
                        circumference: 180,
                        rotation: 270
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '80%',
                    plugins: { legend: { display: false }, tooltip: { enabled: false } }
                }
            });
        }

        // --- Mid-to-Long Term Initialization ---
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                line: { tension: 0.4, borderWidth: 3, borderColor: '#00e5ff', fill: true, backgroundColor: 'rgba(0, 229, 255, 0.1)' },
                point: { radius: 4, hitRadius: 10, hoverRadius: 6, backgroundColor: '#fff' }
            },
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#aaa', font: { size: 10 } } },
                x: { grid: { display: false }, ticks: { color: '#fff' } }
            }
        };

        const midtermLabels = ['15期(実)', '16期', '17期', '18期', '19期', '20期'];

        const initMidChart = (id, color) => {
            const ctx = document.getElementById(id);
            if (!ctx) return null;
            const cfg = JSON.parse(JSON.stringify(commonOptions));
            cfg.elements.line.borderColor = color;
            cfg.elements.line.backgroundColor = color.replace('1)', '0.1)');
            return new Chart(ctx, {
                type: 'line',
                data: { labels: midtermLabels, datasets: [{ data: [0, 0, 0, 0, 0, 0] }] },
                options: cfg
            });
        };

        midMarketChart = initMidChart('chart-midterm-market', '#00e5ff');
        midSalesChart = initMidChart('chart-midterm-sales', '#00e5ff');
        midProfitChart = initMidChart('chart-midterm-profit', '#ffeb3b');
        midAssetsChart = initMidChart('chart-midterm-assets', '#4caf50');
    }

    function updateMidtermCharts(marketYear1, shareYear1, profitRateYear1) {
        if (!midMarketChart) return;

        const rangeSlider = document.getElementById('midterm-range-slider');
        const numYears = rangeSlider ? parseInt(rangeSlider.value) : 5;
        const currentTerm = 15;

        // Dynamic labels for the requested time range
        const labels = [`${currentTerm}期(実)`];
        for (let i = 1; i <= numYears; i++) {
            labels.push(`${currentTerm + i}期`);
        }

        const growthRate = (marketYear1 / 1950) - 1;
        const marketData = [1950];
        const salesData = [390]; // Sample Year 15 Sales
        const profitData = [20];  // Sample Year 15 Profit
        const assetsData = [5000]; // Sample Year 15 Net Assets

        for (let i = 1; i <= numYears; i++) {
            const m = Math.round(1950 * Math.pow(1 + growthRate, i));
            const s = Math.round(m * (shareYear1 / 100));
            const p = Math.round(s * (profitRateYear1 / 100));
            const a = assetsData[i - 1] + p;

            marketData.push(m);
            salesData.push(s);
            profitData.push(p);
            assetsData.push(a);
        }

        const update = (chart, data, newLabels) => {
            if (chart) {
                chart.data.labels = newLabels;
                chart.data.datasets[0].data = data;
                chart.update('none'); // Update without animation for smoother slider feel
            }
        };

        update(midMarketChart, marketData, labels);
        update(midSalesChart, salesData, labels);
        update(midProfitChart, profitData, labels);
        update(midAssetsChart, assetsData, labels);
    }

    function updatePlanCalculations() {
        const marketSize = parseInt(document.getElementById('input-market-size').value) || 0;
        const share = parseInt(document.getElementById('input-share').value) || 0;
        const profitMargin = parseFloat(document.getElementById('input-profit').value) || 0;

        const expectedSales = Math.round(marketSize * (share / 100));
        const netProfit = Math.round(expectedSales * (profitMargin / 100));

        const salesDisp = document.getElementById('disp-expected-sales');
        const profitDisp = document.getElementById('disp-net-profit');

        if (salesDisp) salesDisp.textContent = expectedSales.toLocaleString() + " 億円";
        if (profitDisp) profitDisp.textContent = netProfit.toLocaleString() + " 億円";

        // Update Midterm Charts
        updateMidtermCharts(marketSize, share, profitMargin);
    }

    // Market Growth Slider update
    const rangeGrowth = document.getElementById('range-market-growth');
    if (rangeGrowth) {
        rangeGrowth.addEventListener('input', () => {
            const growthRate = parseFloat(rangeGrowth.value);
            const baseMarketValue = 1950; // Previous Term
            const calculatedMarketSize = Math.round(baseMarketValue * (1 + growthRate / 100));

            const growthDisplay = document.getElementById('disp-market-growth');
            const marketSizeDisplay = document.getElementById('disp-market-size');
            const hiddenInput = document.getElementById('input-market-size');

            if (growthDisplay) {
                growthDisplay.textContent = (growthRate > 0 ? "+" : "") + growthRate + "%";
                growthDisplay.style.color = growthRate > 0 ? "#00e5ff" : (growthRate < 0 ? "#ff5252" : "#fff");
            }
            if (marketSizeDisplay) marketSizeDisplay.textContent = calculatedMarketSize.toLocaleString() + " 億円";
            if (hiddenInput) {
                hiddenInput.value = calculatedMarketSize;
                hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
            }

            if (marketChart) {
                marketChart.data.datasets[0].data[1] = calculatedMarketSize;
                marketChart.update();
            }
            updatePlanCalculations();
        });
    }

    // Share Slider update
    const rangeShare = document.getElementById('range-share');
    if (rangeShare) {
        rangeShare.addEventListener('input', () => {
            const val = rangeShare.value;
            const display = document.getElementById('disp-share');
            const hiddenInput = document.getElementById('input-share');
            if (display) display.textContent = val + "%";
            if (hiddenInput) {
                hiddenInput.value = val;
                hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (shareChart) {
                shareChart.data.datasets[0].data = [val, 100 - val];
                shareChart.update();
            }
            updatePlanCalculations();
        });
    }

    // Profit Slider update
    const rangeProfit = document.getElementById('range-profit');
    if (rangeProfit) {
        rangeProfit.addEventListener('input', () => {
            const val = rangeProfit.value;
            const display = document.getElementById('disp-profit');
            const hiddenInput = document.getElementById('input-profit');
            if (display) display.textContent = val + "%";
            if (hiddenInput) {
                hiddenInput.value = val;
                hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (profitChart) {
                profitChart.data.datasets[0].data = [val, 100 - val];
                profitChart.update();
            }
            updatePlanCalculations();
        });
    }

    // --- Closing Summary Performance Charts ---
    let closingProfitabilityChart = null;
    let closingAssetsChart = null;

    function initClosingSummaryCharts() {
        const marketCtx = document.getElementById('chart-closing-profitability');
        if (marketCtx) {
            closingProfitabilityChart = new Chart(marketCtx, {
                type: 'bar',
                data: {
                    labels: ['11期', '12期', '13期', '14期'],
                    datasets: [
                        {
                            label: '市場規模 (億円)',
                            data: [1800, 1850, 1950, 2000],
                            backgroundColor: '#00e5ff',
                            borderColor: '#00e5ff',
                            borderWidth: 1,
                            borderRadius: 5,
                            barThickness: 30
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8 }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            ticks: { color: '#00e5ff', font: { weight: 'bold' } },
                            min: 1500
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#aaa', font: { weight: 'bold' } }
                        }
                    }
                }
            });
        }

        const shareCtx = document.getElementById('chart-closing-assets');
        if (shareCtx) {
            closingAssetsChart = new Chart(shareCtx, {
                type: 'doughnut',
                data: {
                    labels: ['DEMO', 'キス', 'リオ', 'G-DASH', 'ユア・サポート'],
                    datasets: [{
                        data: [20, 20, 20, 20, 20],
                        backgroundColor: [
                            '#00e5ff',
                            '#1e88e5',
                            '#ffeb3b',
                            '#f44336',
                            '#4caf50'
                        ],
                        hoverOffset: 15,
                        borderWidth: 2,
                        borderColor: '#0a1929'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                color: '#fff',
                                padding: 15,
                                font: { weight: 'bold', size: 12 }
                            }
                        }
                    },
                    animation: { animateScale: true, animateRotate: true }
                }
            });
        }
    }

    // --- Closing Summary Toggle Logic ---
    document.querySelectorAll('.chart-switch .switch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const container = btn.closest('.chart-switch');
            const chartId = container.getAttribute('data-chart');
            const mode = btn.getAttribute('data-mode');

            // Update UI
            container.querySelectorAll('.switch-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (chartId === 'market-trend' && closingProfitabilityChart) {
                if (mode === 'sales') {
                    closingProfitabilityChart.data.datasets[0].label = '市場規模 (億円)';
                    closingProfitabilityChart.data.datasets[0].data = [1800, 1850, 1950, 2000];
                    closingProfitabilityChart.options.scales.y.min = 1500;
                    closingProfitabilityChart.options.scales.y.ticks.callback = (value) => value + ' 億円';
                } else {
                    closingProfitabilityChart.data.datasets[0].label = '市場規模 (台)';
                    closingProfitabilityChart.data.datasets[0].data = [45000, 46000, 48500, 50000];
                    closingProfitabilityChart.options.scales.y.min = 40000;
                    closingProfitabilityChart.options.scales.y.ticks.callback = (value) => value.toLocaleString() + ' 台';
                }
                closingProfitabilityChart.update();
            } else if (chartId === 'market-share' && closingAssetsChart) {
                if (mode === 'sales') {
                    closingAssetsChart.data.datasets[0].data = [20, 20, 20, 20, 20]; // Sample Sales Share
                } else {
                    closingAssetsChart.data.datasets[0].data = [15, 25, 20, 18, 22]; // Sample Volume Share
                }
                closingAssetsChart.update();
            }
        });
    });

    // Initialize charts
    initManagementPlanCharts();
    initClosingSummaryCharts();

    // --- Collapsible Cards Logic ---
    document.querySelectorAll('.card-header-toggle').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('.collapsible-card');
            if (card) {
                card.classList.toggle('collapsed');
            }
        });
    });

    // --- Brand Identity Selection Logic (Marketing Mix) ---
    const brandOptionLists = document.querySelectorAll('.brand-option-list');

    function updateCombinedStrategyProgress() {
        const card = document.querySelector('.mgmt-strategy-subset')?.closest('.strategy-card');
        if (!card) return;

        const progressFill = card.querySelector('.card-progress-fill');
        const progressLabel = card.querySelector('.card-progress-label');
        if (!progressFill || !progressLabel) return;

        // 1. Management Strategy Progress (0 or 20%)
        const strategySelected = !!card.querySelector('input[name="mgmt_strategy"]:checked');
        const strategyScore = strategySelected ? 20 : 0;

        // 2. Marketing Mix Progress (0 to 80%)
        const brandOptionLists = document.querySelectorAll('.brand-option-list');
        let filledGroups = 0;
        brandOptionLists.forEach(list => {
            if (list.querySelector('.brand-option-item.active')) {
                filledGroups++;
            }
        });
        const marketingScore = (filledGroups / 4) * 80;

        const totalPercent = strategyScore + marketingScore;
        progressFill.style.width = `${totalPercent}%`;

        // Label logic
        if (totalPercent === 100) {
            progressLabel.textContent = '策定完了';
            progressLabel.style.color = '#00e5ff';
        } else if (totalPercent > 0) {
            progressLabel.textContent = '策定中';
            progressLabel.style.color = '#ffeb3b';
        } else {
            progressLabel.textContent = '未入力';
            progressLabel.style.color = '#aaa';
        }
    }

    document.querySelectorAll('.brand-option-item').forEach(item => {
        item.addEventListener('click', () => {
            const group = item.closest('.brand-option-list');
            // Remove active from others in the same group
            group.querySelectorAll('.brand-option-item').forEach(i => i.classList.remove('active'));
            // Add to this one
            item.classList.add('active');

            // Visual accumulation effect: gain +5pt on click (simulated)
            const bar = item.querySelector('.equity-bar-fill');
            if (bar) {
                let currentWidth = parseInt(bar.style.width) || 0;
                if (currentWidth < 95) {
                    bar.style.width = (currentWidth + 5) + "%";
                    const label = item.querySelector('.equity-val-label');
                    if (label) label.textContent = (currentWidth + 5) + "pt";
                }
            }

            updateCombinedStrategyProgress();

            // Trigger a sound or small effect if available (optional)
            // Save state if needed
            const groupId = group.getAttribute('data-group');
            const optionId = item.getAttribute('data-id');
            localStorage.setItem(`bizex_p4_${groupId}`, optionId);
        });
    });

    // Load saved states
    brandOptionLists.forEach(list => {
        const groupId = list.getAttribute('data-group');
        const saved = localStorage.getItem(`bizex_p4_${groupId}`);
        if (saved) {
            const item = list.querySelector(`.brand-option-item[data-id="${saved}"]`);
            if (item) item.classList.add('active');
        }
    });
    updateCombinedStrategyProgress();

    // 4. For Management Plan Inputs (Market Size, Share, Profit)
    const planInputs = document.querySelectorAll('.plan-input');
    if (planInputs.length > 0) {
        const updatePlanProgress = () => {
            let filledCount = 0;
            planInputs.forEach(input => {
                if (input.value !== "") filledCount++;
            });

            const card = planInputs[0].closest('.strategy-card');

            if (card) {
                const progressFill = card.querySelector('.card-progress-fill');
                const progressLabel = card.querySelector('.card-progress-label');

                const percentage = (filledCount / planInputs.length) * 100;

                if (progressFill) progressFill.style.width = `${percentage}%`;

                if (progressLabel) {
                    if (filledCount === 0) {
                        progressLabel.textContent = '未入力';
                        progressLabel.style.color = '#aaa';
                    } else if (filledCount === planInputs.length) {
                        progressLabel.textContent = '計算完了';
                        progressLabel.style.color = '#00e5ff';
                    } else {
                        progressLabel.textContent = '入力中';
                        progressLabel.style.color = '#ffeb3b';
                    }
                }
            }
        };

        planInputs.forEach(input => {
            input.addEventListener('input', updatePlanProgress);
        });
    }

    // 1. For Textareas (Marketing Strategy & Philosophy)
    const strategyTextareas = document.querySelectorAll('.strategy-textarea');
    strategyTextareas.forEach(textarea => {
        const card = textarea.closest('.strategy-card');
        if (card) {
            const updateStrategyProgress = () => {
                // If this is the combined Philosophy & Culture card, use the unified logic
                if (card.querySelector('.culture-section')) {
                    updateUnifiedProgress(card);
                    return;
                }

                const progressFill = card.querySelector('.card-progress-fill');
                const progressLabel = card.querySelector('.card-progress-label');
                const hasText = textarea.value.trim().length > 0;
                if (progressFill) progressFill.style.width = hasText ? '100%' : '0%';
                if (progressLabel) {
                    progressLabel.textContent = hasText ? '入力済' : '未入力';
                    progressLabel.style.color = hasText ? '#00e5ff' : '#aaa';
                }
            };

            textarea.addEventListener('input', updateStrategyProgress);
            updateStrategyProgress();
        }
    });

    // 2. For Selection Cards (Management Strategy)
    const strategyRadioInputs = document.querySelectorAll('.strategy-option input[type="radio"]');
    strategyRadioInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            // Remove selected class from siblings
            const allOptions = input.closest('.strategy-options-grid').querySelectorAll('.strategy-option');
            allOptions.forEach(opt => opt.classList.remove('selected'));

            // Add selected class to parent label
            const label = input.closest('.strategy-option');
            label.classList.add('selected');

            // Update Combined Progress
            updateCombinedStrategyProgress();
        });
    });

    // Midterm Time Range Slider update
    const midtermRangeSlider = document.getElementById('midterm-range-slider');
    const midtermRangeDisplay = document.getElementById('midterm-range-display');
    if (midtermRangeSlider && midtermRangeDisplay) {
        midtermRangeSlider.addEventListener('input', () => {
            const val = midtermRangeSlider.value;
            midtermRangeDisplay.textContent = val + "年";

            // Re-run calculations which calls updateMidtermCharts with new slider value
            updatePlanCalculations();
        });
    }
});
