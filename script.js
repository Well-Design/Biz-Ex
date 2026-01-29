function switchTab(tabName, element) {
    document.getElementById('mission-content').style.display = 'none';
    document.getElementById('list-content').style.display = 'none';
    const tabs = document.querySelectorAll('.panel-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName + '-content').style.display = 'block';
    element.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
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
        const scale = Math.min(scaleX, scaleY);

        // Apply zoom
        document.body.style.zoom = scale;

        // Note: 'zoom' property automatically handles layout scaling
        // unlike 'transform: scale', so dragging coordinates usually work fine.
    }

    window.addEventListener('resize', adjustZoom);
    adjustZoom(); // Initial call

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

        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;

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

        // Individual Menu Progress Bars Animation
        const menuBars = document.querySelectorAll('.menu-item-progress-bar');
        const originalWidths = [];

        // 1. Store original widths and Animate to 100%
        if (progressBar) progressBar.style.width = '100%';
        if (progressText) progressText.textContent = '100%';

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
                            title: { display: true, text: `単位：${set.unit}`, color: '#666' },
                            grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        x: { grid: { display: false } }
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
                            labels: { color: '#333', font: { weight: 'bold', size: 14 } }
                        },
                        title: {
                            display: true,
                            text: '現在期の株主構成',
                            font: { size: 16 }
                        }
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
});
