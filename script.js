class ResolutionCalculator {
    constructor() {
        this.currentMode = 'resolution';
        this.isFullscreen = false;
        this.init();
    }

    init() {
        this.setupModeSwitcher();
        this.setupInputs();
        this.setupFullscreen();
        this.updatePreview();
    }

    setupModeSwitcher() {
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const mode = btn.dataset.mode;
                this.switchMode(mode);
            });
        });
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        document.querySelectorAll('.calculator').forEach(calc => {
            calc.classList.add('hidden');
        });
        
        document.querySelector(`.${mode}-mode`).classList.remove('hidden');
        
        this.updatePreview();
    }

    setupInputs() {
        const inputs = document.querySelectorAll('.input-field');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });
    }

    setupFullscreen() {
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.enterFullscreen());
        document.getElementById('aspectFullscreenBtn').addEventListener('click', () => this.enterFullscreen(true));
        document.getElementById('exitBtn').addEventListener('click', () => this.exitFullscreen());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            }
        });

        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            if (!this.isFullscreen) {
                this.exitFullscreen();
            }
        });
    }

    calculateDimensions(isAspect = false) {
        if (isAspect) {
            const width = parseFloat(document.getElementById('aspectWidth').value) || 16;
            const height = parseFloat(document.getElementById('aspectHeight').value) || 9;
            const baseSize = parseFloat(document.getElementById('baseSize').value) || 100;
            
            const aspectRatio = width / height;
            const calculatedWidth = baseSize * aspectRatio;
            const calculatedHeight = baseSize;
            
            return { width: calculatedWidth, height: calculatedHeight, aspect: `${width}:${height}` };
        } else {
            const width = parseFloat(document.getElementById('width').value) || 1920;
            const height = parseFloat(document.getElementById('height').value) || 1080;
            
            return { width, height, aspect: `${width}Ã—${height}` };
        }
    }

    updatePreview() {
        const dimensions = this.calculateDimensions(this.currentMode === 'aspect');
        
        // Update info text
        if (this.currentMode === 'resolution') {
            const width = dimensions.width || 1920;
            const height = dimensions.height || 1080;
            const gcd = this.gcd(width, height);
            const aspectWidth = width / gcd;
            const aspectHeight = height / gcd;
            document.getElementById('resolutionInfo').textContent = `Aspect Ratio: ${aspectWidth}:${aspectHeight}`;
        } else {
            const width = dimensions.width || 177.78;
            const height = dimensions.height || 100;
            document.getElementById('aspectInfo').textContent = `Resolution: ${Math.round(width)}Ã—${Math.round(height)}`;
        }

        const preview = this.currentMode === 'aspect' 
            ? document.getElementById('aspectPreviewSquare')
            : document.getElementById('previewSquare');
        
        const aspectRatio = dimensions.width / dimensions.height;
        const maxWidth = 200;
        const maxHeight = 150;
        
        let previewWidth, previewHeight;
        
        if (aspectRatio > 1) {
            previewWidth = maxWidth;
            previewHeight = maxWidth / aspectRatio;
        } else {
            previewHeight = maxHeight;
            previewWidth = maxHeight * aspectRatio;
        }
        
        preview.style.width = `${previewWidth}px`;
        preview.style.height = `${previewHeight}px`;
    }

    gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    async enterFullscreen(isAspect = false) {
        const dimensions = this.calculateDimensions(isAspect);
        const overlay = document.getElementById('fullscreenOverlay');
        const square = document.getElementById('fullscreenSquare');
        
        // Show overlay first
        overlay.classList.add('show');
        
        // Calculate dimensions to fit screen
        const aspectRatio = dimensions.width / dimensions.height;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        
        let width, height;
        
        if (screenWidth / screenHeight > aspectRatio) {
            height = screenHeight * 0.95;
            width = height * aspectRatio;
        } else {
            width = screenWidth * 0.95;
            height = width / aspectRatio;
        }
        
        square.style.width = `${width}px`;
        square.style.height = `${height}px`;
        
        // Request fullscreen
        try {
            await overlay.requestFullscreen();
            this.isFullscreen = true;
        } catch (err) {
            console.log('Fullscreen not supported, using overlay mode');
            this.isFullscreen = false;
        }
    }

    exitFullscreen() {
        const overlay = document.getElementById('fullscreenOverlay');
        
        if (this.isFullscreen && document.fullscreenElement) {
            document.exitFullscreen();
        }
        
        overlay.classList.remove('show');
        this.isFullscreen = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ResolutionCalculator();
});
