function switchTab(tabName, element) {
    document.getElementById('mission-content').style.display = 'none';
    document.getElementById('list-content').style.display = 'none';
    const tabs = document.querySelectorAll('.panel-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName + '-content').style.display = 'block';
    element.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    let manualScale = 1.0;
    let autoScale = 1.0;

    // --- Fixed Resolution Scaler (Zoom Method) ---
    function adjustZoom() {
        // Mobile layout logic: disable zoom calculation and reset
        if (window.innerWidth <= 1024) {
            document.body.style.zoom = 1.0;
            return;
        }

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

    trendCloseBtn.addEventListener('click', () => {
        trendWindow.style.display = 'none';
    });

    document.addEventListener('mouseout', (e) => {
        const input = e.target.closest('.sheet-input');
        if (input) {
            hidePopover();
        }
    });

    quickPopover.addEventListener('mouseenter', () => {
        if (hideTimeout) clearTimeout(hideTimeout);
    });

    quickPopover.addEventListener('mouseleave', () => {
        hidePopover();
    });

    console.log('Biz-Ex Audio System Initializing...');

    let audioCtx;
    const bgm = document.getElementById('home-bgm');
    const bgmBtn = document.getElementById('bgm-toggle');
    const seBtn = document.getElementById('se-toggle');

    // Load states from localStorage (default to ON if never set)
    let isBgmEnabled = localStorage.getItem('bgm_enabled') !== 'false';
    let isSeEnabled = localStorage.getItem('se_enabled') !== 'false';
    let audioStarted = false;

    // --- Core Sound Engine ---
    function initAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            console.log('AudioContext Created');
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
            console.log('AudioContext Resumed');
        }
        return audioCtx;
    }

    function playClickSound() {
        if (!isSeEnabled) return; // Respect SE setting
        const ctx = initAudioContext();
        if (!ctx) return;
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
    }

    // --- Unified User Interaction Handler ---
    const handleInteraction = () => {
        initAudioContext();

        // Start BGM if enabled and not already started
        if (!audioStarted && bgm && isBgmEnabled) {
            bgm.volume = 0.3;
            bgm.play().then(() => {
                audioStarted = true;
                updateAudioButtonsUI();
                console.log('BGM Started based on saved state');
            }).catch(err => console.log('Waiting for interaction to play BGM...'));
        }
    };

    document.addEventListener('click', (e) => {
        handleInteraction();
        // Play Click SE if interactive element
        const trigger = e.target.closest('button, a, .menu-item, .stakeholder-card, .f-btn, .panel-tab, .btn-action');

        if (trigger) {
            // Check if it's a navigation link that needs a delay to play sound
            const isNavLink = trigger.tagName === 'A' && trigger.getAttribute('href') && !trigger.getAttribute('href').startsWith('javascript:');

            if (isNavLink) {
                // Prevent immediate navigation to let sound play
                e.preventDefault();
                const url = trigger.getAttribute('href');
                playClickSound();
                console.log('Navigating with sound delay:', url);
                setTimeout(() => {
                    window.location.href = url;
                }, 100); // 100ms is enough for sound trigger and barely felt as lag
            } else {
                playClickSound();
                console.log('SE Triggered on:', trigger.className || trigger.tagName);
            }
        }
    }, true);

    document.addEventListener('keydown', handleInteraction);

    // --- Audio Control Buttons ---
    if (bgmBtn && bgm) {
        bgmBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!bgm.paused) {
                bgm.pause();
                isBgmEnabled = false;
            } else {
                initAudioContext();
                bgm.play();
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
            if (isSeEnabled) playClickSound(); // Feedback
        });
    }

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

    // Initialize UI state immediately
    updateAudioButtonsUI();

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

        // Update Card Progress Bar (Culture)
        const consumed = TOTAL_POINTS - remaining;
        const progressFill = document.getElementById('culture-progress-fill');
        const progressLabel = document.getElementById('culture-progress-label');
        if (progressFill && progressLabel) {
            const percent = (consumed / TOTAL_POINTS) * 100;
            progressFill.style.width = `${percent}%`;
            progressLabel.textContent = `${consumed}/${TOTAL_POINTS} pt`;
        }

        // Save to LocalStorage
        const cultureData = {};
        inputs.forEach(input => {
            const type = input.closest('.culture-item').getAttribute('data-type');
            cultureData[type] = input.value;
        });
        localStorage.setItem('bizex_culture_allocation', JSON.stringify(cultureData));
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

    // --- Collapsible Cards Logic ---
    document.querySelectorAll('.card-header-toggle').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('.collapsible-card');
            if (card) {
                card.classList.toggle('collapsed');
            }
        });
    });

    // --- Strategy Input Progress Logic ---
    // 3. For 4P Marketing Mix Selection
    const p4Selects = document.querySelectorAll('.p4-select');
    if (p4Selects.length > 0) {
        const updateP4Progress = () => {
            let filledCount = 0;
            p4Selects.forEach(select => {
                if (select.value !== "") filledCount++;
            });

            // Find the closest strategy card (assuming all selects are within the same strategy section)
            // Use the first select to identify the container card
            const card = p4Selects[0].closest('.strategy-card');

            if (card) {
                const progressFill = card.querySelector('.card-progress-fill');
                const progressLabel = card.querySelector('.card-progress-label');

                // Calculate percentage based on 4 items
                const percentage = (filledCount / p4Selects.length) * 100;

                if (progressFill) progressFill.style.width = `${percentage}%`;

                if (progressLabel) {
                    if (filledCount === 0) {
                        progressLabel.textContent = '未入力';
                        progressLabel.style.color = '#aaa';
                    } else if (filledCount === p4Selects.length) {
                        progressLabel.textContent = '選択済';
                        progressLabel.style.color = '#00e5ff';
                    } else {
                        progressLabel.textContent = '入力中';
                        progressLabel.style.color = '#ffeb3b';
                    }
                }
            }
        };

        p4Selects.forEach(select => {
            select.addEventListener('change', updateP4Progress);
        });
    }

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
            const progressFill = card.querySelector('.card-progress-fill');
            const progressLabel = card.querySelector('.card-progress-label');

            const updateStrategyProgress = () => {
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

            // Update Progress
            const card = input.closest('.strategy-card');
            if (card) {
                const progressFill = card.querySelector('.card-progress-fill');
                const progressLabel = card.querySelector('.card-progress-label');
                if (progressFill) progressFill.style.width = '100%';
                if (progressLabel) {
                    progressLabel.textContent = '選択済';
                    progressLabel.style.color = '#00e5ff';
                }
            }
        });
    });
});
