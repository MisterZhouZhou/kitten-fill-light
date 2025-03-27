document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const colorBtns = document.querySelectorAll('.color-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const brightnessSlider = document.getElementById('brightness');
    const saturationSlider = document.getElementById('saturation');
    const hueSlider = document.getElementById('hue');
    const brightnessValue = document.getElementById('brightness-value');
    const saturationValue = document.getElementById('saturation-value');
    const hueValue = document.getElementById('hue-value');
    const smoothnessSlider = document.getElementById('smoothness');
    const whiteningSlider = document.getElementById('whitening');
    const slimfaceSlider = document.getElementById('slimface');
    const smoothnessValue = document.getElementById('smoothness-value');
    const whiteningValue = document.getElementById('whitening-value');
    const slimfaceValue = document.getElementById('slimface-value');
    const stickerBtns = document.querySelectorAll('.sticker-btn');
    const captureBtn = document.getElementById('capture-btn');
    const shareBtn = document.getElementById('share-btn');
    
    // 设置初始状态
    let currentFilter = 'normal';
    let currentBgColor = '#FFFFFF';
    let brightness = 100;
    let saturation = 100;
    let hue = 0;
    let smoothness = 30;
    let whitening = 20;
    let slimface = 0;
    let currentSticker = 'none';
    
    // 设置canvas尺寸
    function setupCanvas() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }
    
    // 初始化摄像头
    async function initCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            video.srcObject = stream;
            
            video.onloadedmetadata = () => {
                setupCanvas();
                requestAnimationFrame(processFrame);
            };
        } catch (err) {
            console.error('摄像头访问失败:', err);
            alert('无法访问摄像头，请确保已授予权限并刷新页面。');
        }
    }
    
    // 处理视频帧
    function processFrame() {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            // 绘制视频帧到canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // 应用背景色
            if (currentBgColor !== '#FFFFFF') {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                const bgColor = hexToRgb(currentBgColor);
                
                for (let i = 0; i < data.length; i += 4) {
                    // 简单的亮度检测，亮度高的像素可能是面部高光区域
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // 计算亮度
                    const brightness = (r + g + b) / 3;
                    
                    // 如果亮度较高，保留原像素
                    if (brightness > 200) {
                        continue;
                    }
                    
                    // 否则，混合背景色
                    const blendFactor = 0.3;
                    data[i] = r * (1 - blendFactor) + bgColor.r * blendFactor;
                    data[i + 1] = g * (1 - blendFactor) + bgColor.g * blendFactor;
                    data[i + 2] = b * (1 - blendFactor) + bgColor.b * blendFactor;
                }
                
                ctx.putImageData(imageData, 0, 0);
            }
            
            // 应用滤镜
            applyFilter();
        }
        
        requestAnimationFrame(processFrame);
    }
    
    // 应用滤镜
    function applyFilter() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const brightnessValue = brightness / 100;
        const saturationValue = saturation / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // 应用亮度
            r = r * brightnessValue;
            g = g * brightnessValue;
            b = b * brightnessValue;
            
            // 应用饱和度
            const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
            r = gray * (1 - saturationValue) + r * saturationValue;
            g = gray * (1 - saturationValue) + g * saturationValue;
            b = gray * (1 - saturationValue) + b * saturationValue;
            
            // 应用色相
            if (hue !== 0) {
                const hsv = rgbToHsv(r, g, b);
                hsv.h = (hsv.h + hue) % 360;
                const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
                r = rgb.r;
                g = rgb.g;
                b = rgb.b;
            }
            
            // 应用预设滤镜
            switch (currentFilter) {
                case 'warm':
                    r = r * 1.1;
                    g = g * 1.05;
                    b = b * 0.9;
                    break;
                case 'cool':
                    r = r * 0.9;
                    g = g * 0.95;
                    b = b * 1.1;
                    break;
                case 'vintage':
                    r = r * 1.1;
                    g = g * 0.9;
                    b = b * 0.8;
                    break;
                case 'dreamy':
                    r = r * 1.05;
                    g = g * 1.05;
                    b = b * 1.1;
                    // 添加轻微的粉色调
                    r = r + 10;
                    g = g + 5;
                    break;
                case 'sweet':
                    r = r * 1.08;
                    g = g * 1.02;
                    b = b * 1.05;
                    // 添加粉红色调
                    r = r + 15;
                    g = g + 5;
                    break;
                case 'fresh':
                    r = r * 0.95;
                    g = g * 1.1;
                    b = b * 1.05;
                    break;
                case 'elegant':
                    r = r * 1.02;
                    g = g * 1.0;
                    b = b * 1.08;
                    // 添加淡紫色调
                    r = r + 5;
                    b = b + 10;
                    break;
            }
            
            // 应用美白效果
            if (whitening > 0) {
                const whiteningFactor = whitening / 100;
                r = r + (255 - r) * whiteningFactor * 0.5;
                g = g + (255 - g) * whiteningFactor * 0.5;
                b = b + (255 - b) * whiteningFactor * 0.5;
            }
            
            // 应用平滑效果 (简化版)
            if (smoothness > 0) {
                // 这里需要更复杂的算法，简化示例
                // 实际实现需要使用高斯模糊或其他皮肤平滑算法
            }
            
            // 确保值在有效范围内
            data[i] = Math.min(255, Math.max(0, r));
            data[i + 1] = Math.min(255, Math.max(0, g));
            data[i + 2] = Math.min(255, Math.max(0, b));
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // 应用贴纸 (如果选择了贴纸)
        applySticker();
    }
    
    // 添加贴纸功能
    function applySticker() {
        if (currentSticker !== 'none') {
            // 这里需要加载贴纸图像并绘制到canvas上
            // 实际实现需要根据人脸检测来定位贴纸位置
        }
    }
    
    // 添加拍照保存功能
    captureBtn.addEventListener('click', () => {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = '美颜自拍_' + new Date().getTime() + '.png';
        link.click();
    });
    
    // 添加分享功能
    shareBtn.addEventListener('click', async () => {
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], '美颜自拍.png', { type: 'image/png' });
            
            if (navigator.share) {
                await navigator.share({
                    title: '我的美颜自拍',
                    text: '使用小猫补光灯拍摄的美颜照片',
                    files: [file]
                });
            } else {
                alert('您的浏览器不支持分享功能，请长按图片保存后手动分享');
            }
        } catch (err) {
            console.error('分享失败:', err);
        }
    });
    
    // 事件监听器
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBgColor = btn.dataset.color;
        });
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
        });
    });
    
    brightnessSlider.addEventListener('input', () => {
        brightness = parseInt(brightnessSlider.value);
        brightnessValue.value = brightness;
    });
    
    brightnessValue.addEventListener('input', () => {
        let value = parseInt(brightnessValue.value);
        // 确保值在有效范围内
        value = Math.min(200, Math.max(0, value));
        brightnessValue.value = value;
        brightnessSlider.value = value;
        brightness = value;
    });
    
    saturationSlider.addEventListener('input', () => {
        saturation = parseInt(saturationSlider.value);
        saturationValue.value = saturation;
    });
    
    saturationValue.addEventListener('input', () => {
        let value = parseInt(saturationValue.value);
        // 确保值在有效范围内
        value = Math.min(200, Math.max(0, value));
        saturationValue.value = value;
        saturationSlider.value = value;
        saturation = value;
    });
    
    hueSlider.addEventListener('input', () => {
        hue = parseInt(hueSlider.value);
        hueValue.value = hue;
    });
    
    hueValue.addEventListener('input', () => {
        let value = parseInt(hueValue.value);
        // 确保值在有效范围内
        value = Math.min(360, Math.max(0, value));
        hueValue.value = value;
        hueSlider.value = value;
        hue = value;
    });
    
    smoothnessSlider.addEventListener('input', () => {
        smoothness = parseInt(smoothnessSlider.value);
        smoothnessValue.value = smoothness;
    });
    
    smoothnessValue.addEventListener('input', () => {
        let value = parseInt(smoothnessValue.value);
        value = Math.min(100, Math.max(0, value));
        smoothnessValue.value = value;
        smoothnessSlider.value = value;
        smoothness = value;
    });
    
    whiteningSlider.addEventListener('input', () => {
        whitening = parseInt(whiteningSlider.value);
        whiteningValue.value = whitening;
    });
    
    whiteningValue.addEventListener('input', () => {
        let value = parseInt(whiteningValue.value);
        value = Math.min(100, Math.max(0, value));
        whiteningValue.value = value;
        whiteningSlider.value = value;
        whitening = value;
    });
    
    slimfaceSlider.addEventListener('input', () => {
        slimface = parseInt(slimfaceSlider.value);
        slimfaceValue.value = slimface;
    });
    
    slimfaceValue.addEventListener('input', () => {
        let value = parseInt(slimfaceValue.value);
        value = Math.min(100, Math.max(0, value));
        slimfaceValue.value = value;
        slimfaceSlider.value = value;
        slimface = value;
    });
    
    stickerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            stickerBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSticker = btn.dataset.sticker;
        });
    });
    
    // 辅助函数
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }
    
    function rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, v = max;
        
        const d = max - min;
        s = max === 0 ? 0 : d / max;
        
        if (max === min) {
            h = 0;
        } else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s: s, v: v };
    }
    
    function hsvToRgb(h, s, v) {
        h /= 360;
        let r, g, b;
        
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    // 初始化
    initCamera();
    
    // 设置默认选中的背景色和滤镜
    colorBtns[5].classList.add('active'); // 白色背景
    filterBtns[0].classList.add('active'); // 原始滤镜
}); 